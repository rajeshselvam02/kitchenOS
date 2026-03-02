#!/bin/bash
# kitchenOS - Stop all services

echo "🛑 Stopping kitchenOS..."

# Kill processes on service ports
for port in 3000 3001 3002; do
    pid=$(lsof -ti:$port 2>/dev/null || netstat -tulpn 2>/dev/null | grep ":$port" | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
        echo "Stopped service on port $port"
    fi
done

echo "✓ All services stopped"
