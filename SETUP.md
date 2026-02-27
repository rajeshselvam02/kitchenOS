# kitchenOS - Setup Guide

## Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL 14+ with TimescaleDB extension
- Redis 7+

## 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo and all services.

## 2. Database Setup

### Create Database

```bash
# Create PostgreSQL database
createdb kitchenos_dev

# Enable TimescaleDB (optional but recommended)
psql kitchenos_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

### Run Migrations

```bash
cd packages/db
npm run build
npm run migrate
```

### Seed Test Data

```bash
npm run seed
```

This creates:
- 3 sample dishes (Double Chicken Burger, Veg Pizza, Paneer Tikka)
- 6 ingredients (Chicken, Buns, Cheese, Tomatoes, Onions, Paneer)
- Recipe for Double Chicken Burger
- 2 test users (owner@example.com, chef@example.com)

## 3. Redis Setup

Make sure Redis is running:

```bash
# Start Redis (if not already running)
redis-server

# Or with Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

## 4. Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=postgresql://localhost/kitchenos_dev
REDIS_URL=redis://localhost:6379
```

## 5. Build All Services

```bash
# Build shared packages first
cd packages/types && npm run build
cd ../db && npm run build

# Or build everything at once
npm run build --workspaces
```

## 6. Run Services

### Option A: Run all services (separate terminals)

```bash
# Terminal 1: Ingestion Service (port 3000)
cd services/ingestion
npm run dev

# Terminal 2: KDS Service (port 3001)
cd services/kds
npm run dev

# Terminal 3: Inventory Service (port 3002)
cd services/inventory
npm run dev
```

### Option B: Use tmux (recommended)

```bash
# Create a tmux session with all services
tmux new-session -s kitchenos -d
tmux send-keys -t kitchenos:0 'cd services/ingestion && npm run dev' C-m
tmux split-window -h -t kitchenos:0
tmux send-keys -t kitchenos:0.1 'cd services/kds && npm run dev' C-m
tmux split-window -v -t kitchenos:0.1
tmux send-keys -t kitchenos:0.2 'cd services/inventory && npm run dev' C-m
tmux attach -t kitchenos
```

## 7. Test the System

### Create a test order

```bash
curl -X POST http://localhost:3000/test/order \
  -H "Content-Type: application/json" \
  -d '{"aggregator": "swiggy"}'
```

Response:
```json
{
  "success": true,
  "orderId": "abc-123-def",
  "message": "Test order created"
}
```

### View orders in KDS

```bash
curl http://localhost:3001/orders
```

### Mark order as cooking

```bash
curl -X POST http://localhost:3001/orders/{orderId}/cooking
```

### Mark order as ready (triggers inventory deduction)

```bash
curl -X POST http://localhost:3001/orders/{orderId}/ready
```

### Check inventory transactions

```bash
curl http://localhost:3002/transactions
```

You should see automatic deductions for:
- 360g of Chicken (180g × 2 burgers)
- 2 Buns
- 4 Cheese Slices

## 8. Verify the Loop

The complete flow:

```
1. POST /test/order
   → Creates order in DB
   → Publishes "order.created" event

2. GET /orders (KDS)
   → Shows order as "pending"

3. POST /orders/{id}/cooking
   → Updates status to "cooking"

4. POST /orders/{id}/ready
   → Updates status to "ready"
   → Publishes "order.ready" event
   → Inventory service picks up event
   → Deducts ingredients based on BOM
   → Logs transaction
   → Alerts if stock is low

5. GET /transactions (Inventory)
   → Shows deduction history
```

## Troubleshooting

### "Connection refused" errors

- Make sure PostgreSQL is running: `pg_isready`
- Make sure Redis is running: `redis-cli ping` (should return "PONG")

### "Relation does not exist"

- Run migrations: `cd packages/db && npm run migrate`

### Services not finding dependencies

- Build shared packages first: `cd packages/types && npm run build`

### Redis events not working

- Check Redis connection in service logs
- Test Redis: `redis-cli SUBSCRIBE kitchenos:events`
