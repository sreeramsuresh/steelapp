# Steel Trading App - Branch Strategy Guide

## Branch Overview

This repository uses a three-branch strategy optimized for different stages of development and deployment:

```
main/sree (base)
├── development (for local development)
├── uat (for user testing)
└── production (for live deployment)
```

## 🔧 Development Branch

**Purpose**: Local development and feature development  
**Environment**: Development/Local  
**Target Users**: Developers

### Features
- ✅ Enhanced debugging and logging
- ✅ Permissive CORS settings
- ✅ Relaxed security for development
- ✅ Hot reload and dev tools enabled
- ✅ Verbose error messages
- ✅ SQL query logging
- ✅ Development database (steel_trading_dev)

### Quick Start
```bash
# Switch to development branch
git checkout development

# Install dependencies
npm install

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with local database settings

# Start development servers
npm run dev
# In another terminal: cd backend && php -S localhost:8000
```

### Configuration
- **Database**: `steel_trading_dev`
- **API URL**: `http://localhost:8000/api/`
- **Frontend**: `http://localhost:5173`
- **Debug Mode**: Enabled
- **Rate Limiting**: Relaxed (1000 requests/hour)

### Documentation
📖 See [README-DEV.md](README-DEV.md) for detailed setup instructions.

---

## 🧪 UAT Branch

**Purpose**: User Acceptance Testing  
**Environment**: Staging/Testing  
**Target Users**: Stakeholders, QA testers, End users

### Features
- ✅ Production-like security settings
- ✅ UAT feedback system for issue reporting
- ✅ Test data and sample users
- ✅ Performance monitoring
- ✅ User training environment
- ✅ Moderate rate limiting
- ✅ UAT-specific database (steel_trading_uat)

### Quick Start
```bash
# Switch to UAT branch
git checkout uat

# Build for UAT
npm run build

# Deploy to UAT server
# (Follow UAT deployment instructions)
```

### Configuration
- **Database**: `steel_trading_uat`
- **API URL**: `https://uat.steeltrading.com/backend/api/`
- **Frontend**: `https://uat.steeltrading.com`
- **Debug Mode**: Disabled
- **Rate Limiting**: Moderate (200 requests/hour)
- **Special Features**: UAT Feedback button, Test credentials

### Test Credentials
- **Admin**: admin@steeltrading.com / admin123
- **Manager**: manager@steeltrading.com / manager123
- **User**: user@steeltrading.com / user123

### Documentation
📖 See [README-UAT.md](README-UAT.md) for testing guide and procedures.

---

## 🚀 Production Branch

**Purpose**: Live production deployment  
**Environment**: Production  
**Target Users**: End customers

### Features
- ✅ Maximum security configuration
- ✅ Performance optimization
- ✅ Error reporting and monitoring
- ✅ Automated deployment script
- ✅ Backup and recovery procedures
- ✅ SSL enforcement
- ✅ Production database (steel_trading_prod)

### Quick Start
```bash
# Switch to production branch
git checkout production

# Run deployment script
./deploy-production.sh

# Follow deployment checklist
# Upload package to production server
```

### Configuration
- **Database**: `steel_trading_prod`
- **API URL**: `https://yourdomain.com/backend/api/`
- **Frontend**: `https://yourdomain.com`
- **Debug Mode**: Disabled
- **Rate Limiting**: Strict (100 requests/hour)
- **Security**: Maximum (HTTPS, Security headers, CORS restrictions)

### Documentation
📖 See [README-PRODUCTION.md](README-PRODUCTION.md) for deployment guide.

---

## Branch Workflow

### 1. Feature Development
```bash
# Start from development branch
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/new-feature

# Develop and test locally
# ... make changes ...

# Commit and push
git add .
git commit -m "Add: new feature"
git push origin feature/new-feature

# Create pull request to development branch
```

### 2. UAT Testing
```bash
# Merge approved features to UAT
git checkout uat
git pull origin uat
git merge development

# Deploy to UAT environment
npm run build
# Deploy to UAT server

# Test with stakeholders
# Collect feedback via UAT feedback system
```

### 3. Production Deployment
```bash
# After UAT approval, merge to production
git checkout production
git pull origin production
git merge uat

# Run deployment script
./deploy-production.sh

# Deploy to production server
# Follow production checklist
```

## Environment Comparison

| Feature | Development | UAT | Production |
|---------|-------------|-----|------------|
| Debug Mode | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Verbose Logging | ✅ Yes | ⚠️ Limited | ❌ Errors Only |
| Rate Limiting | 🟢 Relaxed | 🟡 Moderate | 🔴 Strict |
| CORS | 🟢 Permissive | 🟡 Restricted | 🔴 Domain Only |
| SSL Required | ❌ No | ✅ Yes | ✅ Yes |
| Error Details | ✅ Full Stack | ⚠️ Limited | ❌ Generic |
| Dev Tools | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Hot Reload | ✅ Yes | ❌ No | ❌ No |
| Feedback System | ❌ No | ✅ Yes | ❌ No |
| Performance Monitoring | ❌ No | ✅ Yes | ✅ Yes |

## Database Strategy

Each environment uses a separate database to prevent conflicts:

- **Development**: `steel_trading_dev` - For local testing
- **UAT**: `steel_trading_uat` - For user testing with sample data
- **Production**: `steel_trading_prod` - Live customer data

## Security Considerations

### Development
- Permissive settings for ease of development
- Local-only access
- Debug information exposed
- Relaxed authentication

### UAT
- Production-like security
- Test data only
- Limited access to UAT domain
- Feedback collection enabled

### Production
- Maximum security settings
- Live customer data protection
- SSL enforcement
- Strict CORS and rate limiting
- Security headers enabled

## Deployment Process

### Automated Deployment
Each branch includes deployment automation:

- **Development**: Local setup scripts
- **UAT**: Staging deployment procedures
- **Production**: Automated deployment script with validation

### Manual Steps
1. **Development**: Follow README-DEV.md
2. **UAT**: Follow README-UAT.md and testing procedures
3. **Production**: Run deploy-production.sh and follow checklist

## Branch Maintenance

### Regular Tasks
- Keep branches updated with security patches
- Review and update environment configurations
- Test deployment procedures regularly
- Monitor performance across all environments

### Security Updates
```bash
# Apply security updates to all branches
for branch in development uat production; do
    git checkout $branch
    # Apply security updates
    git add .
    git commit -m "Security: update dependencies"
    git push origin $branch
done
```

## Support and Troubleshooting

### Development Issues
- Check README-DEV.md
- Review local environment setup
- Verify database connections

### UAT Issues
- Use UAT feedback system
- Check README-UAT.md
- Review test scenarios

### Production Issues
- Follow emergency procedures in README-PRODUCTION.md
- Check monitoring alerts
- Review production logs

## Best Practices

1. **Never develop directly on UAT or production branches**
2. **Always test in development before UAT**
3. **Get UAT approval before production deployment**
4. **Keep environment configurations up to date**
5. **Monitor all environments regularly**
6. **Maintain separate databases for each environment**
7. **Follow security best practices for each environment**

This branch strategy ensures safe, tested, and secure deployments while maintaining development velocity.