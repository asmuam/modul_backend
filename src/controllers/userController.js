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
        await userService.deleteUser(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export { getUsers, getUser, updateUser, deleteUser };
