#!/usr/bin/env bash
# Render build script for Node.js + Python dependencies

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python and pip if not available
echo "🐍 Setting up Python..."
python3 --version || (echo "Python not found" && exit 1)

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install --upgrade pip
pip3 install -r requirements.txt

echo "✅ Build complete!"
