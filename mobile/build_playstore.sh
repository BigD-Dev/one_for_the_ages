#!/bin/bash
# ============================================================
# 🤖 OFTA Mobile App - Play Store Deployment Script
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
echo -e "║  ${BLUE}🤖 OFTA - Play Store Build${NC}                            ║"
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
npx cap sync android

# Build Android
echo -e "${BLUE}📦 Building Android AAB...${NC}"
cd android
./gradlew bundleRelease
cd ..

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open Android Studio: npx cap open android"
echo "2. Build → Generate Signed Bundle/APK"
echo "3. Upload to Play Console"
echo ""
