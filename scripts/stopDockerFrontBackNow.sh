#!/bin/bash

# Usage:
#   ./stop_services.sh        # Stop immediately (no argument)
#   ./stop_services.sh <sec>  # Stop after <sec> seconds

TIMER="$1"

# If no argument is provided, default to 0 (stop immediately)
if [ -z "$TIMER" ]; then
    TIMER=0
fi

echo "Services will stop in $TIMER second(s)..."
sleep $TIMER

echo "Stopping services..."
docker stop city-digital-twin-backend city-digital-twin-frontend mnt-graphdb-1
docker rm city-digital-twin-backend city-digital-twin-frontend 
echo "Services stopped."
