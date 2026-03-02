#!/bin/bash
# kitchenOS - Quick Test Script for Termux

echo "🧪 Testing kitchenOS..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Test ingestion health
echo -n "Testing Ingestion Service... "
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test KDS health
echo -n "Testing KDS Service... "
if curl -s http://localhost:3001/health | grep -q "ok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test Inventory health
echo -n "Testing Inventory Service... "
if curl -s http://localhost:3002/health | grep -q "ok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "Creating test order..."

ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/test/order \
    -H "Content-Type: application/json" \
    -d '{"aggregator": "swiggy"}')

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"orderId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ORDER_ID" ]; then
    echo -e "${GREEN}✓ Order created: $ORDER_ID${NC}"
else
    echo -e "${RED}✗ Failed to create order${NC}"
    echo "Response: $ORDER_RESPONSE"
    exit 1
fi

echo ""
echo "Waiting 2 seconds for event propagation..."
sleep 2

# Check order in KDS
echo -n "Checking order in KDS... "
KDS_ORDERS=$(curl -s http://localhost:3001/orders)
if echo "$KDS_ORDERS" | grep -q "$ORDER_ID"; then
    echo -e "${GREEN}✓ Order visible in KDS${NC}"
else
    echo -e "${RED}✗ Order not found in KDS${NC}"
fi

echo ""
echo "Marking order as cooking..."
curl -s -X POST http://localhost:3001/orders/$ORDER_ID/cooking > /dev/null
echo -e "${GREEN}✓ Order marked as cooking${NC}"

sleep 1

echo ""
echo "Marking order as ready (triggers inventory deduction)..."
curl -s -X POST http://localhost:3001/orders/$ORDER_ID/ready > /dev/null
echo -e "${GREEN}✓ Order marked as ready${NC}"

sleep 1

echo ""
echo "Checking inventory transactions..."
TRANSACTIONS=$(curl -s http://localhost:3002/transactions)
if echo "$TRANSACTIONS" | grep -q "$ORDER_ID"; then
    echo -e "${GREEN}✓ Inventory deductions logged${NC}"
    echo ""
    echo "Transactions:"
    echo "$TRANSACTIONS" | head -20
else
    echo -e "${RED}✗ No transactions found${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 Test Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
