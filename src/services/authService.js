import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../database.js';
import config from '../config.js';

const registerUser = async (username, password, email) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            email,
        },
    });
};

const authenticateUser = async (username, password) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, { expiresIn: '5m' });

        // Save refresh token to the database
        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken }
        });

        return { token, refreshToken };
    }
    throw new Error('Invalid credentials');
};

const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};

const refreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, config.refreshSecret);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.refresh_token !== refreshToken) {
            throw new Error('Invalid refresh token');
        }

        // Generate a new access token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
        return token;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

const logoutUser = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, config.refreshSecret);
        await prisma.user.update({
            where: { id: decoded.id },
            data: { refresh_token: null }
        });
    } catch (error) {
        throw new Error('Error during logout');
    }
};

export { registerUser, authenticateUser, verifyToken, refreshToken, logoutUser };
