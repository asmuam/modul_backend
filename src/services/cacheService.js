// src/services/cacheService.js
import CustomError from '../utils/CustomError.js';

class CacheService {
  constructor(cacheProvider) {
    this.cacheProvider = cacheProvider;
  }

  async set(key, value, ttl) {
    try {
      return await this.cacheProvider.set(key, value, ttl);
    } catch (error) {
      throw new CustomError(
        `Cache set operation failed: ${error.message}`,
        500
      );
    }
  }

  async get(key) {
    try {
      const value = await this.cacheProvider.get(key);
      if (value === null) {
        // Assuming null means the key doesn't exist
        throw new CustomError('Cache key not found', 404);
      }
      return value;
    } catch (error) {
      throw new CustomError(
        `Cache get operation failed: ${error.message}`,
        500
      );
    }
  }

  async del(key) {
    try {
      await this.cacheProvider.del(key);
    } catch (error) {
      throw new CustomError(
        `Cache delete operation failed: ${error.message}`,
        500
      );
    }
  }

  async has(key) {
    try {
      const value = await this.get(key);
      return value !== undefined; // or whatever condition you need
    } catch (error) {
      return false; // If there's an error, assume the key doesn't exist
    }
  }

  async mset(pairs, ttl) {
    try {
      for (const [key, value] of Object.entries(pairs)) {
        await this.set(key, value, ttl);
      }
    } catch (error) {
      throw new CustomError(
        `Cache multi-set operation failed: ${error.message}`,
        500
      );
    }
  }

  async mget(keys) {
    try {
      const results = await Promise.all(keys.map((key) => this.get(key)));
      return results;
    } catch (error) {
      throw new CustomError(
        `Cache multi-get operation failed: ${error.message}`,
        500
      );
    }
  }

  // Other caching methods can be added here...
}

export default CacheService;
