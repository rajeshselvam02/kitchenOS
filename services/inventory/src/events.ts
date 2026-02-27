import { createClient } from 'redis';
import { KitchenOSEvent } from '@kitchenos/types';
import { deductInventory } from './deduction';

let redisClient: ReturnType<typeof createClient>;

export async function initRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));

  await redisClient.connect();
  console.log('✅ Connected to Redis');
}

export function subscribeToEvents() {
  // Subscribe to order.ready events
  const subscriber = redisClient.duplicate();
  
  subscriber.connect().then(() => {
    subscriber.subscribe('kitchenos:events', async (message) => {
      try {
        const event: KitchenOSEvent = JSON.parse(message);
        
        if (event.type === 'order.ready') {
          console.log('📦 Order ready event received:', event.payload.orderId);
          await deductInventory(event.payload.orderId);
        }
      } catch (error) {
        console.error('Error processing event:', error);
      }
    });
    
    console.log('✅ Subscribed to kitchenos:events');
  });
}

export async function publishEvent(event: KitchenOSEvent) {
  await redisClient.publish('kitchenos:events', JSON.stringify(event));
}

export { redisClient };
