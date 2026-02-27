# kitchenOS - Quick Start

**Get the MVP running in 5 minutes.**

## Prerequisites Check

```bash
node --version    # Should be 20+
psql --version    # Should be 14+
redis-cli ping    # Should return "PONG"
```

## 1. Install & Build

```bash
cd kitchenOS
npm install
npm run build --workspaces
```

## 2. Database Setup

```bash
# Create database
createdb kitchenos_dev

# Run migrations & seed
cd packages/db
npm run migrate
npm run seed
cd ../..
```

## 3. Start Services

**Option A: Three terminals**

```bash
# Terminal 1
cd services/ingestion && npm run dev

# Terminal 2
cd services/kds && npm run dev

# Terminal 3
cd services/inventory && npm run dev
```

**Option B: One command (with tmux)**

```bash
./start-dev.sh
```

## 4. Test It

```bash
./test-flow.sh
```

You should see:
- ✅ Order created
- ✅ Inventory deducted
- ✅ Audit trail logged

## 5. Manual Testing

```bash
# Create order
curl -X POST http://localhost:3000/test/order

# Get order ID from response, then:
ORDER_ID="<paste-id-here>"

# Mark as cooking
curl -X POST http://localhost:3001/orders/$ORDER_ID/cooking

# Mark as ready (triggers inventory deduction)
curl -X POST http://localhost:3001/orders/$ORDER_ID/ready

# Check inventory
curl http://localhost:3002/ingredients
curl http://localhost:3002/transactions
```

## Architecture At-a-Glance

```
Port 3000: Ingestion   (Order webhooks)
Port 3001: KDS         (Kitchen display + WebSocket)
Port 3002: Inventory   (Real-time deduction)

Event Flow:
  Order Created → Redis Event Bus → KDS displays
  Order Ready → Redis Event Bus → Inventory deducts → Audit log
```

## What's Working

✅ Order ingestion (test endpoint + webhook placeholders)  
✅ Real-time KDS updates via WebSocket  
✅ BOM-based inventory deduction  
✅ Audit logging (GST-compliant)  
✅ Low stock alerts  

## What's Next

🚧 KDS UI (React + WebSocket)  
🚧 Admin Dashboard (inventory + P&L)  
📋 Real aggregator integration  
📋 Visual improvements (icons, colors)  

## Need Help?

- Full setup: `SETUP.md`
- Project overview: `PROJECT.md`
- Task list: `TODO.md`
- Architecture: `README.md`

---

**Built the core in 2 hours. Let's ship this. 🚀**
