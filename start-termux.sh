#!/bin/bash
# kitchenOS - Termux/Android Startup Script
# No Docker required - runs directly on Termux

set -e

echo "🍳 kitchenOS - Termux Startup"
echo "=============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check dependencies
check_deps() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js not found. Install with: pkg install nodejs${NC}"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    echo -e "${GREEN}✓ npm: $(npm --version)${NC}"
}

# Start PostgreSQL (if available)
start_postgres() {
    if command -v psql &> /dev/null; then
        echo -e "${YELLOW}Starting PostgreSQL...${NC}"
        if command -v service &> /dev/null; then
            service postgresql start 2>/dev/null || true
        elif [ -f /usr/bin/pg_ctl ]; then
            pg_ctl -D $PREFIX/var/lib/postgresql start -l $PREFIX/var/log/postgresql.log 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "${YELLOW}PostgreSQL not found - will use SQLite fallback${NC}"
    fi
}

# Start Redis (if available)
start_redis() {
    if command -v redis-server &> /dev/null; then
        echo -e "${YELLOW}Starting Redis...${NC}"
        redis-server --daemonize yes 2>/dev/null || true
        echo -e "${GREEN}✓ Redis started${NC}"
    else
        echo -e "${YELLOW}Redis not found - will use in-memory fallback${NC}"
    fi
}

# Install dependencies
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies (this may take a while)...${NC}"
        npm install
    fi
}

# Build packages
build_packages() {
    echo -e "${YELLOW}Building packages...${NC}"
    npm run build --workspaces --if-present 2>/dev/null || true
}

# Run database migrations
run_migrations() {
    if [ -d "packages/db" ]; then
        echo -e "${YELLOW}Running database migrations...${NC}"
        cd packages/db
        npm run migrate 2>/dev/null || echo "Migration skipped (may already be done)"
        npm run seed 2>/dev/null || echo "Seed skipped (may already be done)"
        cd ../..
    fi
}

# Start services in background
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Kill any existing processes on our ports
    kill_port 3000 2>/dev/null || true
    kill_port 3001 2>/dev/null || true
    kill_port 3002 2>/dev/null || true
    
    # Start ingestion service
    echo -e "${GREEN}Starting Ingestion Service (port 3000)...${NC}"
    cd services/ingestion
    nohup npm run dev > ../../logs/ingestion.log 2>&1 &
    cd ../..
    
    sleep 2
    
    # Start KDS service
    echo -e "${GREEN}Starting KDS Service (port 3001)...${NC}"
    cd services/kds
    nohup npm run dev > ../../logs/kds.log 2>&1 &
    cd ../..
    
    sleep 2
    
    # Start Inventory service
    echo -e "${GREEN}Starting Inventory Service (port 3002)...${NC}"
    cd services/inventory
    nohup npm run dev > ../../logs/inventory.log 2>&1 &
    cd ../..
    
    sleep 2
}

# Kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || netstat -tulpn 2>/dev/null | grep ":$port" | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
    fi
}

# Create logs directory
mkdir -p logs

# Run startup sequence
check_deps
start_postgres
start_redis
install_deps
build_packages
run_migrations
start_services

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🍳 kitchenOS is running!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Services:"
echo "  - Ingestion:  http://localhost:3000"
echo "  - KDS:        http://localhost:3001"
echo "  - Inventory:  http://localhost:3002"
echo ""
echo "KDS UI:         file://$(pwd)/apps/kds-ui/index.html"
echo ""
echo "Test order:     curl -X POST http://localhost:3000/test/order"
echo ""
echo "Logs:           tail -f logs/*.log"
echo ""
echo "To stop:        ./stop-termux.sh"
echo ""
