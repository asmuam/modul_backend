import { prisma } from '../database.js';
import bcrypt from 'bcrypt';
import cacheService from '../cache/cacheManager.js'; // Import the cache service

const getAllUsers = async () => {
  // Check if users are cached
  const cachedUsers = await cacheService.get('all_users');
  if (cachedUsers) {
    return JSON.parse(cachedUsers); // Return cached users if available
  }

  // If not cached, fetch from database
  const users = await prisma.user.findMany();

  // Cache the users for future requests
  await cacheService.set('all_users', JSON.stringify(users), 3600); // Cache for 1 hour

  return users;
};

const findUserByUsernameOrEmail = async (username, email) => {
  // Create a unique cache key
  const cacheKey = `user:${username || email}`;

  // Check if the user is cached
  const cachedUser = await cacheService.get(cacheKey);
  if (cachedUser) {
    return JSON.parse(cachedUser); // Return cached user if available
  }

  // If not cached, fetch from database
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  // Cache the user if found
  if (user) {
    await cacheService.set(cacheKey, JSON.stringify(user), 3600); // Cache for 1 hour
  }

  return user;
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

    // Invalidate the cache for all users since a new user is created
    await cacheService.delete('all_users');

    return user;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

const getUserById = async (id) => {
  // Create a unique cache key
  const cacheKey = `user:${id}`;

  // Check if the user is cached
  const cachedUser = await cacheService.get(cacheKey);
  if (cachedUser) {
    return JSON.parse(cachedUser); // Return cached user if available
  }

  // If not cached, fetch from database
  const user = await prisma.user.findUnique({ where: { id } });

  // Cache the user if found
  if (user) {
    await cacheService.set(cacheKey, JSON.stringify(user), 3600); // Cache for 1 hour
  }

  return user;
};

const updateUser = async (id, data) => {
  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });

  // Invalidate the cache for the updated user
  await cacheService.delete(`user:${id}`);
  // Also invalidate the cache for all users since the user list may change
  await cacheService.delete('all_users');

  return updatedUser;
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

  // Invalidate the cache for the deleted user
  await cacheService.delete(`user:${id}`);
  // Also invalidate the cache for all users since the user list may change
  await cacheService.delete('all_users');

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
