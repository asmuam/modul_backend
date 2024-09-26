import * as userService from '../services/userService.js';
import { validationResult } from 'express-validator';
import { verifyToken } from '../services/authService.js';
import config from '../config.js';

const getUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userService.getUserById(parseInt(req.params.userId));
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email } = req.body;

    // Check if a user with the same username or email already exists
    const existingUser = await userService.findUserByUsernameOrEmail(
      username,
      email
    );

    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const user = await userService.createUser(req.body);
    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).send('Failed to Create User');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).send('No refresh token provided');
  }

  // Decode the refresh token to get user information
  const decoded = verifyToken(refreshToken, config.refreshSecret);

  try {
    const currentUserRole = decoded.role; // Assuming role is part of the token

    const userIdToUpdate = parseInt(req.params.userId);

    // Check if user exists and get the user to be updated
    const userToUpdate = await userService.getUserById(userIdToUpdate);

    if (!userToUpdate) {
      return res.status(404).send('User not found');
    }

    // Check role downgrade
    if (isRoleDowngrade(currentUserRole, req.body.role)) {
      return res.status(403).send('Cannot downgrade role');
    }

    // Proceed with the update
    const updatedUser = await userService.updateUser(
      parseInt(req.params.userId),
      req.body
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Parse user ID from request parameters
    const userId = parseInt(req.params.userId, 10);

    // Call the service to delete the user and get the deleted user data
    const deletedUser = await userService.deleteUser(userId);

    // Return the deleted user data in the response
    res.status(200).json({
      status: 'success',
      message: 'User deleted',
      deletedUser,
    });
  } catch (error) {
    // Handle errors and send appropriate response
    res.status(500).send(error.message);
  }
};

// Helper function to determine if a role downgrade is occurring
const isRoleDowngrade = (currentRole, newRole) => {
  const roleHierarchy = ['USER', 'ADMIN']; // Define the hierarchy
  return roleHierarchy.indexOf(newRole) < roleHierarchy.indexOf(currentRole);
};

export { getUsers, createUser, getUser, updateUser, deleteUser };
