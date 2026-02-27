import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initRedis, subscribeToEvents } from './events';
import { deductInventory } from './deduction';
import db from '@kitchenos/db';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'inventory' };
});

// Get all ingredients
fastify.get('/ingredients', async () => {
  const result = await db.query('SELECT * FROM ingredients ORDER BY name');
  return result.rows;
});

// Get ingredient by ID
fastify.get<{ Params: { id: string } }>('/ingredients/:id', async (request) => {
  const { id } = request.params;
  const result = await db.query('SELECT * FROM ingredients WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return { error: 'Ingredient not found' };
  }
  
  return result.rows[0];
});

// Get inventory transactions
fastify.get('/transactions', async () => {
  const result = await db.query(`
    SELECT 
      it.*,
      i.name as ingredient_name,
      i.unit
    FROM inventory_transactions it
    JOIN ingredients i ON it.ingredient_id = i.id
    ORDER BY it.created_at DESC
    LIMIT 100
  `);
  return result.rows;
});

// Manual stock adjustment
fastify.post<{
  Body: {
    ingredientId: string;
    quantity: number;
    reason: string;
  };
}>('/adjust', async (request, reply) => {
  const { ingredientId, quantity, reason } = request.body;

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // Update stock
    await client.query(
      'UPDATE ingredients SET stock_quantity = stock_quantity + $1 WHERE id = $2',
      [quantity, ingredientId]
    );

    // Log transaction
    await client.query(
      `INSERT INTO inventory_transactions 
       (ingredient_id, quantity_changed, reason, metadata)
       VALUES ($1, $2, $3, $4)`,
      [ingredientId, quantity, reason, JSON.stringify({ manual: true })]
    );

    await client.query('COMMIT');

    reply.code(200).send({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to adjust stock' });
  } finally {
    client.release();
  }
});

// Start server
async function start() {
  try {
    // Initialize Redis and subscribe to events
    await initRedis();
    subscribeToEvents();

    const port = Number(process.env.INVENTORY_PORT) || 3002;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    fastify.log.info(`Inventory service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
