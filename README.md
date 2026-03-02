# kitchenOS 🍳

**Next-generation cloud kitchen operating system**

Platform-independent prototype for cloud kitchens. Runs on Termux (Android), Linux, macOS, and Windows.

## Quick Start (Termux)

### 1. Install Prerequisites

```bash
# On Termux
pkg update
pkg install nodejs python3 postgresql redis -y

# Start services
service postgresql start
redis-server --daemonize yes
```

### 2. Clone & Setup

```bash
git clone https://github.com/rajeshselvam02/kitchenOS.git
cd kitchenOS
```

### 3. Run Everything

```bash
# One-command startup
./start-termux.sh
```

This will:
- ✅ Install npm dependencies
- ✅ Run database migrations
- ✅ Start all 3 microservices
- ✅ Show you the URLs

### 4. Open KDS UI

```bash
# In a new terminal
./serve-ui.sh
```

Then open: http://localhost:8080

### 5. Test the System

```bash
./test-termux.sh
```

Or manually:

```bash
# Create test order
curl -X POST http://localhost:3000/test/order

# View orders
curl http://localhost:3001/orders | jq

# Mark cooking
curl -X POST http://localhost:3001/orders/<ORDER_ID>/cooking

# Mark ready (triggers inventory deduction)
curl -X POST http://localhost:3001/orders/<ORDER_ID>/ready

# Check transactions
curl http://localhost:3002/transactions | jq
```

## Architecture

```
┌─────────────────┐
│   Swiggy/Zomato │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐     ┌──────────────┐
│ INGESTION (3000)│────▶│ Redis Stream │
└─────────────────┘     └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
      │ KDS (3001)  │  │INVENTORY    │  │ Analytics   │
      │             │  │  (3002)     │  │  (future)   │
      └─────────────┘  └─────────────┘  └─────────────┘
              │                │
              ▼                ▼
      ┌─────────────┐  ┌─────────────┐
      │ KDS UI      │  │ PostgreSQL  │
      │ (WebSocket) │  │ + Timescale │
      └─────────────┘  └─────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Ingestion | 3000 | Receives orders from Swiggy/Zomato webhooks |
| KDS | 3001 | Kitchen Display System with WebSocket |
| Inventory | 3002 | BOM-based deduction, low stock alerts |

## Features

### ✅ Completed (v0.1.0)
- [x] Order ingestion (webhook + test endpoint)
- [x] KDS with real-time WebSocket updates
- [x] BOM-based inventory deduction
- [x] Low stock alerts
- [x] Audit logging
- [x] Visual KDS UI (responsive, dark theme)
- [x] Termux support (no Docker needed)

### 🚧 In Progress
- [ ] Admin dashboard
- [ ] Real Swiggy/Zomato integration
- [ ] Demand forecasting

### 📋 Planned
- [ ] Multi-location support
- [ ] Mobile app for chefs
- [ ] P&L dashboard

## Project Structure

```
kitchenOS/
├── apps/
│   └── kds-ui/           # Frontend (vanilla JS, no build)
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── db/               # Database schema & migrations
├── services/
│   ├── ingestion/        # Order intake
│   ├── kds/              # Kitchen Display
│   └── inventory/        # Stock management
├── start-termux.sh       # One-command startup
├── stop-termux.sh        # Stop all services
├── test-termux.sh        # Integration test
└── serve-ui.sh           # Serve KDS UI
```

## Environment Variables

Create `.env` from `.env.example`:

```env
DATABASE_URL=postgresql://postgres:@localhost/kitchenos_dev
REDIS_URL=redis://localhost:6379
NODE_ENV=development
INGESTION_PORT=3000
KDS_PORT=3001
INVENTORY_PORT=3002
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### PostgreSQL not starting (Termux)
```bash
# Initialize if needed
initdb -D $PREFIX/var/lib/postgresql
service postgresql start
```

### Redis not starting
```bash
# Start manually
redis-server --daemonize yes
# Test
redis-cli ping  # Should return PONG
```

## License

MIT

---

Built with ❤️ for cloud kitchens
