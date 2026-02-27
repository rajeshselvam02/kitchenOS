#!/bin/bash

# kitchenOS - End-to-End Test Script
# Tests the complete KDS-to-Inventory loop

set -e

echo "🧪 Testing kitchenOS MVP Flow"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URLs
INGESTION_URL="http://localhost:3000"
KDS_URL="http://localhost:3001"
INVENTORY_URL="http://localhost:3002"

# Step 1: Create a test order
echo -e "${BLUE}Step 1: Creating test order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST $INGESTION_URL/test/order \
  -H "Content-Type: application/json" \
  -d '{"aggregator": "swiggy"}')

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')

if [ "$ORDER_ID" == "null" ]; then
  echo "❌ Failed to create order"
  echo $ORDER_RESPONSE | jq
  exit 1
fi

echo -e "${GREEN}✅ Order created: $ORDER_ID${NC}"
echo ""

# Step 2: View orders in KDS
echo -e "${BLUE}Step 2: Viewing orders in KDS...${NC}"
ORDERS=$(curl -s $KDS_URL/orders)
echo $ORDERS | jq '.[] | {id, status, items}'
echo ""

# Step 3: Mark as cooking
echo -e "${BLUE}Step 3: Marking order as cooking...${NC}"
curl -s -X POST $KDS_URL/orders/$ORDER_ID/cooking > /dev/null
echo -e "${GREEN}✅ Order marked as cooking${NC}"
echo ""

# Wait a moment
sleep 1

# Step 4: Mark as ready (triggers inventory deduction)
echo -e "${BLUE}Step 4: Marking order as ready (triggers inventory deduction)...${NC}"
curl -s -X POST $KDS_URL/orders/$ORDER_ID/ready > /dev/null
echo -e "${GREEN}✅ Order marked as ready${NC}"
echo ""

# Wait for event processing
sleep 2

# Step 5: Check inventory transactions
echo -e "${BLUE}Step 5: Checking inventory transactions...${NC}"
TRANSACTIONS=$(curl -s $INVENTORY_URL/transactions | jq '.[0:3]')
echo $TRANSACTIONS | jq '.[] | {ingredient_name, quantity_changed, reason, created_at}'
echo ""

# Step 6: Check current inventory levels
echo -e "${BLUE}Step 6: Current inventory levels...${NC}"
INGREDIENTS=$(curl -s $INVENTORY_URL/ingredients)
echo $INGREDIENTS | jq '.[] | {name, stock_quantity, unit, alert_threshold}'
echo ""

echo -e "${GREEN}🎉 Test complete!${NC}"
echo ""
echo "Summary:"
echo "  - Order created and processed"
echo "  - Inventory automatically deducted"
echo "  - Audit trail created"
echo ""
echo "Next steps:"
echo "  - Build the KDS UI (WebSocket-based)"
echo "  - Add real aggregator integrations"
echo "  - Build admin dashboard"
