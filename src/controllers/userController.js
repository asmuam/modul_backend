import * as userService from '../services/userService.js';
import { validationResult } from 'express-validator';
import { verifyToken } from '../services/authService.js';
import config from '../config.js';
import sendResponse from '../utils/responseUtil.js'; // Import utilitas respons
import CustomError from '../utils/CustomError.js';

const getUsers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  try {
    const users = await userService.getAllUsers();
    return sendResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  try {
    const user = await userService.getUserById(parseInt(req.params.userId));
    if (user) {
      return sendResponse(res, 200, 'User retrieved successfully', user);
    } else {
      return sendResponse(res, 404, 'User not found');
    }
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  try {
    const { username, email } = req.body;

    // Check if a user with the same username or email already exists
    const existingUser = await userService.findUserByUsernameOrEmail(
      username,
      email
    );

    if (existingUser) {
      return sendResponse(res, 409, 'User already exists'); // Conflict
    }

    const user = await userService.createUser(req.body);
    if (user) {
      return sendResponse(res, 201, 'User created successfully', user); // Created
    } else {
      return sendResponse(res, 400, 'Failed to create user');
    }
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendResponse(res, 401, 'No refresh token provided'); // Unauthorized
  }

  // Decode the refresh token to get user information
  const decoded = verifyToken(refreshToken, config.refreshSecret);

  try {
    const currentUserRole = decoded.role; // Assuming role is part of the token

    const userIdToUpdate = parseInt(req.params.userId);

    // Check if user exists and get the user to be updated
    const userToUpdate = await userService.getUserById(userIdToUpdate);

    if (!userToUpdate) {
      return sendResponse(res, 404, 'User not found'); // Not found
    }

    // Check role downgrade
    // harusnya tidak boleh mendowngrade diri sendiri maupun menaikkan diri sendiri
    // role hanya bisa diubah admin saja namun controller update bisa diakses siapa saja minimal user
    if (isRoleDowngrade(currentUserRole, req.body.role)) {
      return sendResponse(res, 403, 'Cannot downgrade role'); // Forbidden
    }

    // Proceed with the update
    const updatedUser = await userService.updateUser(
      parseInt(req.params.userId),
      req.body
    );
    return sendResponse(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  try {
    // Parse user ID from request parameters
    const userId = parseInt(req.params.userId, 10);

    // Call the service to delete the user and get the deleted user data
    const deletedUser = await userService.deleteUser(userId);

    // Return the deleted user data in the response
    return sendResponse(res, 200, 'User deleted successfully', deletedUser);
  } catch (error) {
    // Handle errors and send appropriate response
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(
      res,
      400,
      'Validation failed. Please check your input and try again'
    );
  }
  // Check for Multer errors
  if (!req.file) {
    return next(
      new CustomError('File upload only supports the following filetypes', 400)
    );
  }

  // Further processing if no errors
  // Example: save the profile picture details to the database
  // ...

  res.status(200).json({
    message: 'Profile picture uploaded successfully',
    filename: req.file.filename,
  });
};

// Helper function to determine if a role downgrade is occurring
const isRoleDowngrade = (currentRole, newRole) => {
  const roleHierarchy = ['USER', 'ADMIN']; // Define the hierarchy
  return roleHierarchy.indexOf(newRole) < roleHierarchy.indexOf(currentRole);
};

export {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadProfilePicture,
};
