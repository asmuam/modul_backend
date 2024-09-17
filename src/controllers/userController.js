import * as userService from '../services/userService.js';

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(parseInt(req.params.id));
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Controller function for creating a user
const createUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Check if a user with the same username or email already exists
        const existingUser = await userService.findUserByUsernameOrEmail(username, email);

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
    try {
        const user = await userService.updateUser(parseInt(req.params.id), req.body);
        res.json(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        // Parse user ID from request parameters
        const userId = parseInt(req.params.id, 10);

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
        res.status(400).send(error.message);
    }
};


export { getUsers, createUser, getUser, updateUser, deleteUser };
