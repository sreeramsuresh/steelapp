#!/bin/bash

# Steel Trading App - Production Deployment Script
# Usage: ./deploy-production.sh

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for Steel Trading App"
echo "=================================================="

# Check if we're on production branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "production" ]; then
    echo "❌ Error: You must be on the 'production' branch to deploy"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Run: git checkout production"
    exit 1
fi

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Verify environment files exist
if [ ! -f "backend/.env.production" ]; then
    echo "❌ Error: backend/.env.production not found"
    echo "Copy backend/.env.production and configure it first"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found"
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --production --silent

# Build application
echo "🏗️  Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully"

# Create deployment package
echo "📦 Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="steel-trading-prod-${TIMESTAMP}.tar.gz"

# Create temporary directory for packaging
TEMP_DIR="temp_deployment_${TIMESTAMP}"
mkdir -p "$TEMP_DIR"

# Copy built frontend files
cp -r dist/* "$TEMP_DIR/"

# Copy backend files
mkdir -p "$TEMP_DIR/backend"
cp -r backend/api "$TEMP_DIR/backend/"
cp -r backend/config "$TEMP_DIR/backend/"
cp -r backend/database "$TEMP_DIR/backend/"
cp backend/.env.production "$TEMP_DIR/backend/.env"
cp backend/.htaccess "$TEMP_DIR/backend/"

# Copy root files
cp .htaccess.production "$TEMP_DIR/.htaccess" 2>/dev/null || echo "⚠️  .htaccess.production not found, you'll need to create .htaccess manually"

# Create logs directory
mkdir -p "$TEMP_DIR/backend/logs"
chmod 755 "$TEMP_DIR/backend/logs"

# Set proper permissions
find "$TEMP_DIR" -type f -name "*.php" -exec chmod 644 {} \;
find "$TEMP_DIR" -type f -name ".env" -exec chmod 640 {} \;
find "$TEMP_DIR" -type f -name ".htaccess" -exec chmod 644 {} \;

# Create package
tar -czf "$PACKAGE_NAME" -C "$TEMP_DIR" .

# Cleanup temp directory
rm -rf "$TEMP_DIR"

echo "✅ Deployment package created: $PACKAGE_NAME"

# Calculate package size
PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
echo "📊 Package size: $PACKAGE_SIZE"

# Create deployment checklist
cat > "deployment-checklist-${TIMESTAMP}.md" << EOF
# Production Deployment Checklist - ${TIMESTAMP}

## Pre-Deployment
- [ ] Backup current production database
- [ ] Backup current production files
- [ ] Verify maintenance page is ready

## Database Setup
- [ ] Create production database: steel_trading_prod
- [ ] Create production user with limited permissions
- [ ] Import schema: mysql -u user -p steel_trading_prod < backend/database/schema.sql

## File Deployment
- [ ] Extract: tar -xzf ${PACKAGE_NAME} -C /path/to/public_html/
- [ ] Set file permissions (see README-PRODUCTION.md)
- [ ] Configure backend/.env with production values
- [ ] Test database connection

## Configuration
- [ ] Update JWT_SECRET in .env (must be unique and secure)
- [ ] Update CORS_ORIGINS with your domain
- [ ] Configure SMTP settings for email
- [ ] Set secure database password

## Security
- [ ] Verify HTTPS/SSL is working
- [ ] Test security headers
- [ ] Check .htaccess files are working
- [ ] Test rate limiting

## Testing
- [ ] Test login: https://yourdomain.com
- [ ] Test API: https://yourdomain.com/backend/api/customers
- [ ] Test customer creation
- [ ] Test invoice generation
- [ ] Test PDF export

## Post-Deployment
- [ ] Monitor error logs: backend/logs/app.log
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Document admin credentials change

## Emergency Rollback
If issues occur:
1. Enable maintenance mode
2. Restore previous backup
3. Investigate issues
4. Re-deploy when ready

Package: ${PACKAGE_NAME}
Date: $(date)
Branch: $(git branch --show-current)
Commit: $(git rev-parse HEAD)
EOF

echo "📋 Deployment checklist created: deployment-checklist-${TIMESTAMP}.md"

# Display final instructions
echo ""
echo "🎉 Production package ready for deployment!"
echo "=================================================="
echo "Package: $PACKAGE_NAME"
echo "Size: $PACKAGE_SIZE"
echo ""
echo "Next steps:"
echo "1. Upload $PACKAGE_NAME to your production server"
echo "2. Extract: tar -xzf $PACKAGE_NAME -C /path/to/public_html/"
echo "3. Follow the checklist: deployment-checklist-${TIMESTAMP}.md"
echo "4. Configure backend/.env with production values"
echo "5. Test the deployment thoroughly"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Change JWT_SECRET in backend/.env"
echo "- Update CORS_ORIGINS with your domain"
echo "- Set secure database credentials"
echo "- Change default admin password after deployment"
echo ""
echo "📖 Full documentation: README-PRODUCTION.md"

# Check if git tag exists for this version
VERSION=$(grep "VITE_APP_VERSION" .env.production | cut -d'=' -f2 | tr -d '"')
if [ ! -z "$VERSION" ]; then
    echo ""
    echo "🏷️  Consider tagging this release:"
    echo "git tag -a v${VERSION} -m 'Production release v${VERSION}'"
    echo "git push origin v${VERSION}"
fi

echo ""
echo "✅ Deployment preparation complete!"