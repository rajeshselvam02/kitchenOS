#!/bin/bash

# kitchenOS - Start all services in development mode
# Uses tmux to manage multiple processes

set -e

SESSION_NAME="kitchenos"

# Check if tmux session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo "❌ Session '$SESSION_NAME' already exists. Attach with: tmux attach -t $SESSION_NAME"
  exit 1
fi

echo "🚀 Starting kitchenOS development environment..."

# Create new tmux session (detached)
tmux new-session -d -s $SESSION_NAME -n "kitchenos"

# Split into 3 panes
tmux split-window -h -t $SESSION_NAME:0
tmux split-window -v -t $SESSION_NAME:0.1

# Set pane titles and start services
tmux select-pane -t $SESSION_NAME:0.0 -T "Ingestion"
tmux send-keys -t $SESSION_NAME:0.0 "cd services/ingestion && npm run dev" C-m

tmux select-pane -t $SESSION_NAME:0.1 -T "KDS"
tmux send-keys -t $SESSION_NAME:0.1 "cd services/kds && npm run dev" C-m

tmux select-pane -t $SESSION_NAME:0.2 -T "Inventory"
tmux send-keys -t $SESSION_NAME:0.2 "cd services/inventory && npm run dev" C-m

# Attach to the session
echo "✅ Services started in tmux session '$SESSION_NAME'"
echo ""
echo "Panes:"
echo "  - Top Left:    Ingestion Service (port 3000)"
echo "  - Top Right:   KDS Service (port 3001)"
echo "  - Bottom Right: Inventory Service (port 3002)"
echo ""
echo "Commands:"
echo "  - Detach: Ctrl+B, then D"
echo "  - Switch pane: Ctrl+B, then arrow keys"
echo "  - Kill session: tmux kill-session -t $SESSION_NAME"
echo ""

tmux attach -t $SESSION_NAME
