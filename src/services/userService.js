import { prisma } from '../database.js';
import bcrypt from 'bcrypt';

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const findUserByUsernameOrEmail = async (username, email) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
};

const createUser = async (userData) => {
  try {
    // Hash password yang ada di userData
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Buat user dengan password yang sudah di-hash
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword, // Ganti password dengan hashedPassword
      },
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
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
  // Retrieve the user to be deleted
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Delete the user
  await prisma.user.delete({
    where: { id },
  });

  return user;
};

export {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  findUserByUsernameOrEmail,
};
