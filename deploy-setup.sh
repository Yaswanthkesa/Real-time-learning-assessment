#!/bin/bash

# IntelliSense Learning Platform - Deployment Setup Script
# This script helps you prepare your project for deployment

echo "🚀 IntelliSense Learning Platform - Deployment Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Git not initialized. Initializing...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git already initialized${NC}"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo -e "${YELLOW}Adding GitHub remote...${NC}"
    git remote add origin https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
    echo -e "${GREEN}✓ Remote added${NC}"
else
    echo -e "${GREEN}✓ Remote already exists${NC}"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo ""
    echo -e "${YELLOW}You have uncommitted changes. Committing...${NC}"
    git add .
    git commit -m "Prepare for deployment"
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
fi

# Rename branch to main if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo ""
    echo -e "${YELLOW}Renaming branch to main...${NC}"
    git branch -M main
    echo -e "${GREEN}✓ Branch renamed to main${NC}"
fi

echo ""
echo -e "${GREEN}=================================================="
echo "✓ Setup Complete!"
echo "==================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   ${YELLOW}git push -u origin main${NC}"
echo ""
echo "2. Setup MongoDB Atlas:"
echo "   ${YELLOW}https://www.mongodb.com/cloud/atlas/register${NC}"
echo ""
echo "3. Get Groq API Key:"
echo "   ${YELLOW}https://console.groq.com${NC}"
echo ""
echo "4. Deploy Backend to Railway:"
echo "   ${YELLOW}https://railway.app${NC}"
echo ""
echo "5. Deploy Frontend to Vercel:"
echo "   ${YELLOW}https://vercel.com${NC}"
echo ""
echo "📖 See QUICK_DEPLOY.md for detailed instructions"
echo ""
