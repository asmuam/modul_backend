import * as authService from '../services/authService.js';
import { validationResult } from 'express-validator';
import sendResponse from '../utils/responseUtil.js'; // Import utilitas respons

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again.'
    );
  }
  try {
    const { username, password, email, name, role } = req.body;
    await authService.registerUser(username, password, email, name, role);
    return sendResponse(res, 201, 'User registered', { username, email }); // Mengirim data yang relevan
  } catch (error) {
    if (error.message === 'User with this username or email already exists') {
      return sendResponse(res, 409, error.message); // Conflict for duplicate users
    } else {
      next(error);
    }
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again.'
    );
  }
  try {
    const { login, password } = req.body;
    const { uid, name, token, refreshToken } =
      await authService.authenticateUser(login, password);

    // Set refresh token in an HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set secure flag in production
      sameSite: 'Strict', // Adjust based on your requirements
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return sendResponse(res, 200, 'Login successful', { uid, name, token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Pass the refreshToken to remove it from the database
      await authService.logoutUser(refreshToken);
      res.clearCookie('refreshToken'); // Clear the cookie
    }

    return sendResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return sendResponse(res, 401, 'No refresh token provided');
    }

    const newToken = await authService.refreshToken(refreshToken);

    if (newToken) {
      // Successfully refreshed token
      return sendResponse(res, 200, 'Token refreshed successfully', {
        token: newToken,
      });
    } else {
      // Failed to refresh token
      return sendResponse(res, 401, 'Invalid refresh token or user not found');
    }
  } catch (error) {
    // Log the error and send a generic error response
    next(error);
  }
};

export { register, login, logout, refresh };
