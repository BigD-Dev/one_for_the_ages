#!/bin/bash
# ============================================================
# 🍎 OFTA Mobile App - TestFlight Deployment Script
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo -e "║  ${BLUE}🍎 OFTA - TestFlight Build${NC}                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf out .next

# Build Next.js
echo -e "${BLUE}🔨 Building Next.js app...${NC}"
npm run build

# Sync Capacitor
echo -e "${BLUE}🔄 Syncing Capacitor...${NC}"
npx cap sync ios

# Open Xcode
echo -e "${BLUE}🍎 Opening Xcode...${NC}"
npx cap open ios

echo ""
echo -e "${GREEN}✅ Build ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps in Xcode:${NC}"
echo "1. Select 'Any iOS Device' as target"
echo "2. Product → Archive"
echo "3. Distribute App → App Store Connect"
echo "4. Upload to TestFlight"
echo ""
