#!/bin/bash

# Build the React app
echo "Building React app..."
npm run build

# Start a local server in background to serve the built files
echo "Starting local server for prerendering..."
npx serve -s dist -l 8080 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Run prerender script
echo "Starting prerendering..."
node scripts/prerender.js

# Kill the server
kill $SERVER_PID

echo "Build with prerendering complete!"