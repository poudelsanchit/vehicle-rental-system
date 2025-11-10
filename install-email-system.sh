#!/bin/bash

echo "🚀 Installing Email Notification System..."
echo ""

# Install nodemailer
echo "📦 Installing nodemailer..."
npm install nodemailer
npm install --save-dev @types/nodemailer

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with email credentials (see SETUP_EMAIL_SYSTEM.md)"
echo "2. Test the system using the guide in SETUP_EMAIL_SYSTEM.md"
echo "3. Deploy to enable automated notifications"
echo ""
echo "📚 Documentation:"
echo "- SETUP_EMAIL_SYSTEM.md - Quick setup guide"
echo "- EMAIL_NOTIFICATION_SYSTEM.md - Complete documentation"
echo ""
