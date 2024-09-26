import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../database.js';
import config from '../config.js';

const registerUser = async (username, password, email, name, role) => {
  // Check if user with the given username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  if (existingUser) {
    throw new Error('User with this username or email already exists');
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
  // Determine if login is an email or username
  const isEmail = /\S+@\S+\.\S+/.test(login);

  // Find user by username or email
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: login } : { username: login },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
      expiresIn: '30d',
    });

    // Save refresh token to the database
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
  }
  throw new Error('Invalid credentials');
};

const verifyToken = (token, config) => {
  return jwt.verify(token, config);
};

const refreshToken = async (refreshToken) => {
  try {
    // Verify the provided refresh token
    const decoded = verifyToken(refreshToken, config.refreshSecret);

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    // Check if user exists
    if (!user) {
      console.warn('User not found for refresh token:', decoded.id);
      return null; // Indicate failure
    }

    // Check if the refresh token matches
    if (user.refresh_token !== refreshToken) {
      console.warn('Invalid refresh token:', refreshToken);
      return null; // Indicate failure
    }

    // Generate a new access token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    // Log detailed error and return null
    console.error('Error in refreshToken:', error.message);
    return null;
  }
};

const logoutUser = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken, config.refreshSecret);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { refresh_token: null },
    });
  } catch (error) {
    throw new Error('Error during logout :', error.message);
  }
};

export {
  registerUser,
  authenticateUser,
  verifyToken,
  refreshToken,
  logoutUser,
};
