import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../database.js';
import config from '../config.js';
import CustomError from '../utils/CustomError.js'; // Import CustomError

const registerUser = async (username, password, email, name, role) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  if (existingUser) {
    throw new CustomError(
      'User with this username or email already exists',
      400
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
      name,
      role: role || 'USER',
    },
  });
};

const authenticateUser = async (login, password) => {
  const isEmail = /\S+@\S+\.\S+/.test(login);

  const user = await prisma.user.findUnique({
    where: isEmail ? { email: login } : { username: login },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { uid: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { uid: user.id, username: user.username, role: user.role },
    config.refreshSecret,
    { expiresIn: '30d' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: refreshToken },
  });

  return {
    uid: user.id,
    name: user.name,
    username: user.username,
    token,
    refreshToken,
    role: user.role,
  };
};

const verifyToken = (token, config) => {
  return jwt.verify(token, config);
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken, config.refreshSecret);

    const user = await prisma.user.findUnique({ where: { id: decoded.uid } });

    if (!user) {
      console.warn('User not found for refresh token:', decoded.uid);
      throw new CustomError('User not found', 404);
    }

    if (user.refresh_token !== refreshToken) {
      console.warn('Invalid refresh token:', refreshToken);
      throw new CustomError('Invalid refresh token', 403);
    }

    const token = jwt.sign(
      { uid: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    console.error('Error in refreshToken:', error.message);
    throw new CustomError('Error refreshing token', 500);
  }
};

const logoutUser = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken, config.refreshSecret);
    await prisma.user.update({
      where: { id: decoded.uid },
      data: { refresh_token: null },
    });
  } catch (error) {
    throw new CustomError('Error during logout', 500);
  }
};

export {
  registerUser,
  authenticateUser,
  verifyToken,
  refreshToken,
  logoutUser,
};
