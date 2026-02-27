import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { initRedis, publishEvent, subscribeToEvents } from './events';
import db from '@kitchenos/db';
import { OrderStatus } from '@kitchenos/types';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

// WebSocket support
fastify.register(websocket);

// Store connected clients
const clients = new Set<any>();

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'kds' };
});

// Get all active orders
fastify.get('/orders', async () => {
  const result = await db.query(`
    SELECT 
      o.*,
      json_agg(
        json_build_object(
          'id', oi.id,
          'dishId', oi.dish_id,
          'dishName', d.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN dishes d ON oi.dish_id = d.id
    WHERE o.status IN ('pending', 'cooking')
    GROUP BY o.id
    ORDER BY o.created_at ASC
  `);
  
  return result.rows;
});

// Mark order as cooking
fastify.post<{ Params: { id: string } }>('/orders/:id/cooking', async (request, reply) => {
  const { id } = request.params;

  await db.query(
    'UPDATE orders SET status = $1 WHERE id = $2',
    [OrderStatus.COOKING, id]
  );

  // Broadcast to all connected clients
  broadcastOrderUpdate(id, OrderStatus.COOKING);

  reply.send({ success: true });
});

// Mark order as ready
fastify.post<{ Params: { id: string } }>('/orders/:id/ready', async (request, reply) => {
  const { id } = request.params;

  const readyAt = new Date();

  await db.query(
    'UPDATE orders SET status = $1, ready_at = $2 WHERE id = $3',
    [OrderStatus.READY, readyAt, id]
  );

  // Publish event to trigger inventory deduction
  await publishEvent({
    type: 'order.ready',
    payload: {
      orderId: id,
      readyAt,
    },
  });

  // Broadcast to all connected clients
  broadcastOrderUpdate(id, OrderStatus.READY);

  fastify.log.info(`Order ${id} marked as ready`);

  reply.send({ success: true });
});

// WebSocket endpoint for real-time updates
fastify.register(async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    clients.add(connection);
    
    fastify.log.info('New KDS client connected');

    connection.on('close', () => {
      clients.delete(connection);
      fastify.log.info('KDS client disconnected');
    });
  });
});

function broadcastOrderUpdate(orderId: string, status: OrderStatus) {
  const message = JSON.stringify({
    type: 'order.update',
    payload: { orderId, status },
  });

  clients.forEach((client) => {
    try {
      client.socket.send(message);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
    }
  });
}

// Start server
async function start() {
  try {
    await initRedis();
    subscribeToEvents((event) => {
      // Forward events to connected clients
      clients.forEach((client) => {
        try {
          client.socket.send(JSON.stringify(event));
        } catch (error) {
          console.error('Error sending event to client:', error);
        }
      });
    });

    const port = Number(process.env.KDS_PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    fastify.log.info(`KDS service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
