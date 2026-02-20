#!/bin/bash

# MapLeads Quick Start Script
# This script helps you start both PocketBase and the frontend

echo "🚀 Starting MapLeads..."
echo ""

# Check if PocketBase exists
if [ ! -f "./pocketbase/pocketbase" ]; then
    echo "❌ PocketBase not found!"
    echo "Please download PocketBase from https://pocketbase.io/docs/"
    echo "and place it in the ./pocketbase/ folder"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "./node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f "./.env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Foursquare API key"
    exit 1
fi

# Start PocketBase in background
echo "🗄️  Starting PocketBase..."
cd pocketbase
./pocketbase serve > /dev/null 2>&1 &
POCKETBASE_PID=$!
cd ..

# Wait for PocketBase to start
sleep 2

# Check if PocketBase is running
if ! curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    echo "⚠️  PocketBase might not be running properly"
    echo "Check http://127.0.0.1:8090 manually"
fi

echo "✅ PocketBase running on http://127.0.0.1:8090"
echo "📊 Admin UI: http://127.0.0.1:8090/_/"
echo ""

# Start Proxy Server in background
echo "🔄 Starting Proxy Server..."
node proxy-server.cjs > /dev/null 2>&1 &
PROXY_PID=$!

# Wait for Proxy Server to start
sleep 2

echo "✅ Proxy Server running on http://localhost:3001"
echo ""

# Start frontend
echo "⚛️  Starting React frontend..."
npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping services...'; kill $POCKETBASE_PID $PROXY_PID 2>/dev/null; exit" INT TERM EXIT
