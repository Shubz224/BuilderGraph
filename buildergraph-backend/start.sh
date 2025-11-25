#!/bin/bash

# BuilderGraph Backend - Quick Start Script

echo "🚀 BuilderGraph DKG Backend - Quick Start"
echo "=========================================="
echo ""

# Check if DKG node is running
echo "📡 Checking if DKG node is running on port 9200..."
if curl -s http://localhost:9200/health > /dev/null 2>&1; then
    echo "✅ DKG node is running"
else
    echo "❌ DKG node is NOT running on port 9200"
    echo ""
    echo "Please start the DKG node first:"
    echo "  cd dkg-node"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npm run setup-db

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  npm run dev"
echo ""
echo "The server will be available at: http://localhost:3002"
echo ""
