#!/bin/bash

echo "🚀 Installing ML dependencies for Video Learning Platform"
echo "=========================================================="
echo ""

# Check Python installation
echo "📋 Checking Python installation..."
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null
then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    echo "   Download from: https://www.python.org/downloads/"
    exit 1
fi

# Use python3 if python is not available
PYTHON_CMD="python"
if ! command -v python &> /dev/null
then
    PYTHON_CMD="python3"
fi

echo "✅ Python found: $($PYTHON_CMD --version)"
echo ""

# Check pip installation
echo "📋 Checking pip installation..."
if ! $PYTHON_CMD -m pip --version &> /dev/null
then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

echo "✅ pip found: $($PYTHON_CMD -m pip --version)"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
echo "   This may take 10-30 minutes for first-time installation..."
echo ""

$PYTHON_CMD -m pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ML dependencies installed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Start the backend server: npm run dev"
    echo "   2. Upload a video via the frontend"
    echo "   3. Click 'Process Video' to test ML processing"
    echo ""
    echo "⚠️  Note: First-time model downloads will happen automatically"
    echo "   - Whisper base model: ~140MB"
    echo "   - Mistral-7B model: ~14GB"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
