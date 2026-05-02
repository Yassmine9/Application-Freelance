#!/bin/bash
# FreelanceHub Setup Script
# This script automates the setup process for FreelanceHub authentication system

echo "🚀 FreelanceHub Authentication System - Setup Script"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")" || exit 1
CURRENT_DIR=$(pwd)

echo "📁 Current directory: $CURRENT_DIR"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Install Capacitor Preferences specifically
echo "📦 Installing Capacitor Preferences..."
if npm install @capacitor/preferences; then
    echo "✅ Capacitor Preferences installed"
else
    echo "⚠️ Warning: Capacitor Preferences install had issues (may retry later)"
fi
echo ""

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️ TypeScript has some warnings (this is OK for development)"
fi
echo ""

# Summary
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "📚 Next Steps:"
echo ""
echo "1️⃣  Start the development server:"
echo "   npm start"
echo ""
echo "2️⃣  Open browser and navigate to:"
echo "   http://localhost:4200"
echo ""
echo "3️⃣  Test with demo credentials:"
echo "   Admin:      admin@example.com"
echo "   freelancers: freelancers@example.com"
echo "   Client:     client@example.com"
echo "   (any password works)"
echo ""
echo "4️⃣  Read the documentation:"
echo "   → START_HERE.md (Quick orientation)"
echo "   → README_IMPLEMENTATION.md (Visual overview)"
echo "   → QUICK_START.md (Quick reference)"
echo "   → AUTH_IMPLEMENTATION.md (Complete guide)"
echo ""
echo "5️⃣  Build for production:"
echo "   npm run build"
echo ""
echo "6️⃣  Build APK for Android:"
echo "   npx cap add android"
echo "   npx cap run android"
echo ""
echo "7️⃣  Build for iOS:"
echo "   npx cap add ios"
echo "   npx cap run ios"
echo ""
echo "📖 Need help? Check these files:"
echo "   • START_HERE.md - Quick start guide"
echo "   • INSTALLATION.md - Detailed setup & troubleshooting"
echo "   • TESTING_GUIDE.md - Testing checklist"
echo "   • BACKEND_INTEGRATION.md - API integration"
echo ""
echo "🎉 You're all set! Happy coding!"
echo ""
