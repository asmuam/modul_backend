import { prisma } from '../database.js';

const getAllUsers = async () => {
    return await prisma.user.findMany();
};

const getUserById = async (id) => {
    return await prisma.user.findUnique({ where: { id } });
};

const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({ where: { id } });
};

export { getAllUsers, getUserById, updateUser, deleteUser };
