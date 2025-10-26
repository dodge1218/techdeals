import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

connection.on('error', (err) => {
  console.warn('Redis connection error (using mock mode):', err.message);
});

export const priceCheckQueue = new Queue('price-check', { connection });
export const articleWriterQueue = new Queue('article-writer', { connection });
export const trendFinderQueue = new Queue('trend-finder', { connection });
export const socialPostQueue = new Queue('social-post', { connection });

export async function initQueues() {
  try {
    await connection.connect();
    console.log('✓ Redis connected - Job queues active');
  } catch (error) {
    console.warn('⚠ Redis unavailable - Job queues in mock mode');
  }
}
