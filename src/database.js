import { PrismaClient } from '@prisma/client';

/**
 * Singleton class for PrismaClient connection
 */
class PrismaSingleton {
  constructor() {
    if (!PrismaSingleton.instance) {
      this.prisma = new PrismaClient();
      console.log("Prisma client instance created");
      PrismaSingleton.instance = this;
    }

    return PrismaSingleton.instance;
  }

  getInstance() {
    return this.prisma;
  }
}

// Create a singleton instance of PrismaSingleton
const prismaSingleton = new PrismaSingleton();
const prisma = prismaSingleton.getInstance();

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error', error);
    process.exit(1);
  }
};

export {
  prisma,
  connectDatabase
};
