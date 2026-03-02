#!/bin/bash
# kitchenOS - Simple HTTP server for KDS UI
# Works on Termux without needing to install additional packages

PORT=${1:-8080}
DIR="$(dirname "$0")/apps/kds-ui"

echo "🍳 kitchenOS KDS UI"
echo "==================="
echo ""
echo "Serving: $DIR"
echo "Port: $PORT"
echo ""
echo "Open in browser: http://localhost:$PORT"
echo "Or on mobile: http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Try to use Python's built-in server, fallback to Node.js
if command -v python3 &> /dev/null; then
    cd "$DIR" && python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    cd "$DIR" && python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    cd "$DIR" && npx serve -p $PORT
else
    echo "Error: Need Python or Node.js to serve the UI"
    echo "Install with: pkg install python3"
    exit 1
fi
