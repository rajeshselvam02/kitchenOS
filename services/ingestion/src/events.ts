import { createClient } from 'redis';
import { KitchenOSEvent } from '@kitchenos/types';

let redisClient: ReturnType<typeof createClient>;

export async function initRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));

  await redisClient.connect();
  console.log('✅ Connected to Redis');
}

export async function publishEvent(event: KitchenOSEvent) {
  await redisClient.publish('kitchenos:events', JSON.stringify(event));
}

export { redisClient };
