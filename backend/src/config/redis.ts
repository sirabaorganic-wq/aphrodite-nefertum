import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  lazyConnect: true, // Connect when used to prevent immediate crashes
});

redisConnection.on('connect', () => {
  logger.info(`Redis connected successfully at ${redisUrl}`);
});

redisConnection.on('error', (err: any) => {
  logger.warn(`Redis connection error at ${redisUrl}: ${err.message}. Queues and caching will run with degradation.`);
});

// Proactively connect in background
redisConnection.connect().catch(() => {
  // Ignored warning, already handled by on('error')
});
