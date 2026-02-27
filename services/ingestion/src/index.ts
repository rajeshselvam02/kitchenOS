import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initRedis, publishEvent } from './events';
import db from '@kitchenos/db';
import { Aggregator, OrderStatus } from '@kitchenos/types';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'ingestion' };
});

// Webhook endpoint for Swiggy orders
fastify.post('/webhook/swiggy', async (request, reply) => {
  // In production, verify webhook signature
  const payload = request.body as any;

  fastify.log.info('Received Swiggy order:', payload);

  const orderId = await createOrder(Aggregator.SWIGGY, payload);

  reply.send({ success: true, orderId });
});

// Webhook endpoint for Zomato orders
fastify.post('/webhook/zomato', async (request, reply) => {
  // In production, verify webhook signature
  const payload = request.body as any;

  fastify.log.info('Received Zomato order:', payload);

  const orderId = await createOrder(Aggregator.ZOMATO, payload);

  reply.send({ success: true, orderId });
});

// Test endpoint to create mock orders
fastify.post('/test/order', async (request, reply) => {
  const { aggregator = 'swiggy' } = request.body as any;

  // Create a mock order
  const mockPayload = {
    orderId: `TEST-${Date.now()}`,
    items: [
      { dishId: null, dishName: 'Double Chicken Burger', quantity: 2, price: 199 },
    ],
    totalAmount: 398,
  };

  const orderId = await createOrder(aggregator as Aggregator, mockPayload);

  reply.send({ success: true, orderId, message: 'Test order created' });
});

async function createOrder(aggregator: Aggregator, payload: any): Promise<string> {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (aggregator, aggregator_order_id, status, total_amount, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      aggregator,
      payload.orderId || `${aggregator.toUpperCase()}-${Date.now()}`,
      OrderStatus.PENDING,
      payload.totalAmount || 0,
      JSON.stringify(payload),
    ]);

    const orderId = orderResult.rows[0].id;

    // Create order items
    for (const item of payload.items) {
      // Find dish by name (in production, map aggregator item IDs to our dish IDs)
      let dishId = item.dishId;

      if (!dishId && item.dishName) {
        const dishResult = await client.query(
          'SELECT id FROM dishes WHERE name ILIKE $1 LIMIT 1',
          [item.dishName]
        );
        
        if (dishResult.rows.length > 0) {
          dishId = dishResult.rows[0].id;
        }
      }

      if (dishId) {
        await client.query(`
          INSERT INTO order_items (order_id, dish_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [orderId, dishId, item.quantity, item.price]);
      } else {
        fastify.log.warn(`Dish not found: ${item.dishName}`);
      }
    }

    await client.query('COMMIT');

    // Publish order.created event
    await publishEvent({
      type: 'order.created',
      payload: {
        id: orderId,
        aggregator,
        aggregatorOrderId: payload.orderId,
        status: OrderStatus.PENDING,
        totalAmount: payload.totalAmount || 0,
        items: [],
        createdAt: new Date(),
      },
    });

    fastify.log.info(`✅ Order created: ${orderId}`);

    return orderId;

  } catch (error) {
    await client.query('ROLLBACK');
    fastify.log.error('Error creating order:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Start server
async function start() {
  try {
    await initRedis();

    const port = Number(process.env.INGESTION_PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    fastify.log.info(`Ingestion service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
