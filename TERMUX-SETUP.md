# kitchenOS - Termux/Ubuntu Setup Guide

**Testing kitchenOS on Android (Termux + Ubuntu)**

---

## Prerequisites Check

First, check what you have:

```bash
# Check Node.js version (need 20+)
node --version

# Check if PostgreSQL is installed
which psql

# Check if Redis is installed
which redis-server

# Check npm
npm --version
```

---

## 1. Install Missing Dependencies

### Install PostgreSQL

```bash
# Update packages
apt update

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
service postgresql start

# Check if it's running
service postgresql status
```

### Install Redis

```bash
# Install Redis
apt install -y redis-server

# Start Redis
redis-server --daemonize yes

# Test Redis
redis-cli ping
# Should return: PONG
```

---

## 2. Setup PostgreSQL Database

```bash
# Switch to postgres user and create database
su - postgres -c "createdb kitchenos_dev"

# Or if that doesn't work, try:
sudo -u postgres createdb kitchenos_dev

# Create a PostgreSQL user (if needed)
sudo -u postgres psql -c "CREATE USER kitchenos WITH PASSWORD 'kitchenos123';"
sudo -u postgres psql -c "ALTER USER kitchenos CREATEDB;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kitchenos_dev TO kitchenos;"

# Test connection
psql -U postgres -d kitchenos_dev -c "SELECT version();"
```

---

## 3. Clone and Setup kitchenOS

```bash
# Navigate to home directory
cd ~

# Clone the repo
git clone https://github.com/rajeshselvam02/kitchenOS.git
cd kitchenOS

# Install dependencies (this might take a while on mobile)
npm install

# Build shared packages
npm run build --workspaces
```

---

## 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

Update these values:

```bash
DATABASE_URL=postgresql://postgres:@localhost/kitchenos_dev
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Service ports (use defaults)
INGESTION_PORT=3000
KDS_PORT=3001
INVENTORY_PORT=3002
```

Save and exit (Ctrl+X, then Y, then Enter)

---

## 5. Run Database Migrations

```bash
# Navigate to db package
cd packages/db

# Build
npm run build

# Run migrations
npm run migrate

# Seed test data
npm run seed

# Go back to root
cd ../..
```

You should see:
- ✅ Migration complete
- ✅ Seeded 3 dishes
- ✅ Seeded 6 ingredients
- ✅ Seeded recipe for Double Chicken Burger

---

## 6. Start Services (3 Terminals)

Since you're on mobile, use **tmux** or **screen** to manage multiple terminals.

### Option A: Using tmux (recommended)

```bash
# Install tmux if not available
apt install -y tmux

# Start kitchenOS with the provided script
./start-dev.sh
```

This will open 3 panes:
- **Top Left**: Ingestion Service (port 3000)
- **Top Right**: KDS Service (port 3001)
- **Bottom Right**: Inventory Service (port 3002)

**tmux commands:**
- Switch between panes: `Ctrl+B` then arrow keys
- Detach (keep running): `Ctrl+B` then `D`
- Reattach: `tmux attach -t kitchenos`
- Kill session: `tmux kill-session -t kitchenos`

### Option B: Using screen

```bash
# Install screen
apt install -y screen

# Start 3 sessions
screen -S ingestion
cd ~/kitchenOS/services/ingestion
npm run dev

# Detach: Ctrl+A then D

screen -S kds
cd ~/kitchenOS/services/kds
npm run dev

# Detach: Ctrl+A then D

screen -S inventory
cd ~/kitchenOS/services/inventory
npm run dev

# List screens: screen -ls
# Reattach: screen -r ingestion
```

### Option C: Manual (3 separate terminal sessions)

**Terminal 1:**
```bash
cd ~/kitchenOS/services/ingestion
npm run dev
```

**Terminal 2:**
```bash
cd ~/kitchenOS/services/kds
npm run dev
```

**Terminal 3:**
```bash
cd ~/kitchenOS/services/inventory
npm run dev
```

---

## 7. Test the System

Open a **new terminal** (or detach from tmux with `Ctrl+B D`):

```bash
cd ~/kitchenOS

# Make test script executable if needed
chmod +x test-flow.sh

# Run the test
./test-flow.sh
```

You should see:
- ✅ Order created
- ✅ Order marked as cooking
- ✅ Order marked as ready
- ✅ Inventory deducted
- ✅ Transactions logged

---

## 8. Manual Testing with curl

If the test script has issues, test manually:

### Create an order

```bash
curl -X POST http://localhost:3000/test/order \
  -H "Content-Type: application/json" \
  -d '{"aggregator": "swiggy"}'
```

**Expected response:**
```json
{
  "success": true,
  "orderId": "abc-123-def-456",
  "message": "Test order created"
}
```

**Copy the orderId** from the response.

### View orders in KDS

```bash
curl http://localhost:3001/orders | jq
```

### Mark as cooking

Replace `ORDER_ID` with the actual ID:

```bash
curl -X POST http://localhost:3001/orders/ORDER_ID/cooking
```

### Mark as ready (triggers inventory deduction)

```bash
curl -X POST http://localhost:3001/orders/ORDER_ID/ready
```

### Check inventory transactions

```bash
curl http://localhost:3002/transactions | jq
```

You should see deductions like:
- -360g of Chicken (180g × 2 burgers)
- -2 Buns
- -4 Cheese Slices

### Check current inventory

```bash
curl http://localhost:3002/ingredients | jq
```

---

## Troubleshooting

### "Cannot connect to database"

```bash
# Check if PostgreSQL is running
service postgresql status

# If not, start it
service postgresql start

# Test connection
psql -U postgres -d kitchenos_dev -c "SELECT 1;"
```

### "Redis connection failed"

```bash
# Check if Redis is running
redis-cli ping

# If not, start it
redis-server --daemonize yes
```

### "Port already in use"

```bash
# Find what's using the port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill the process
kill -9 <PID>
```

### "npm install fails" (on Termux)

If you're running in **Termux** (not Ubuntu), you might need:

```bash
# Install build tools
pkg install nodejs python3 make clang

# Then try npm install again
npm install
```

### Services crash on startup

Check logs in the terminal where the service is running. Common issues:

1. **Database not migrated**: Run `cd packages/db && npm run migrate`
2. **Redis not running**: Run `redis-server --daemonize yes`
3. **Port in use**: Kill other processes or change ports in `.env`

---

## Quick Reference

**Start services:**
```bash
./start-dev.sh
```

**Test the system:**
```bash
./test-flow.sh
```

**Stop services (if using tmux):**
```bash
tmux kill-session -t kitchenos
```

**View logs (if using screen):**
```bash
screen -r ingestion  # View ingestion logs
screen -r kds        # View KDS logs
screen -r inventory  # View inventory logs
```

---

## Mobile-Friendly Tips

1. **Use tmux** — easier to manage on small screens
2. **Install `jq`** for prettier JSON: `apt install jq`
3. **Use `nano` for editing** — simpler than vim on mobile
4. **Keep terminal font small** — see more at once
5. **Use termux-api** (if on Termux) for notifications

---

## What's Next?

Once everything is working:

1. ✅ You've verified the core loop works
2. 🚧 Next: Build the KDS UI (React app)
3. 🚧 Then: Admin dashboard

---

**Need help?** Check the logs in each service terminal for detailed error messages.
