// src/cache/cacheManager.js
import NodeCache from 'node-cache';
import Redis from 'ioredis';
import CacheService from '../services/cacheService.js';

const cacheProvider =
  process.env.USE_REDIS === 'true' ? new Redis() : new NodeCache();
const cacheService = new CacheService(cacheProvider);

export default cacheService;
