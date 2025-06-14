# Steel Trading App - Deployment Guide

## Security Improvements Implemented

### Backend Security Features

1. **Environment Configuration System**
   - Secure environment variable handling via `backend/config/env.php`
   - Database credentials externalized to environment variables
   - Environment-specific configuration (development/production)

2. **Input Validation & Security Middleware**
   - Comprehensive input validation in `backend/config/validator.php`
   - XSS protection and SQL injection prevention
   - Rate limiting implementation in `backend/config/security.php`
   - Request size limits and suspicious pattern detection

3. **Authentication & Authorization**
   - JWT-based authentication system in `backend/config/auth.php`
   - API key authentication support
   - Role-based access control (RBAC)
   - Session management and token refresh

4. **Security Headers & CORS**
   - Proper CORS configuration with domain whitelisting
   - Security headers implementation
   - CSRF token generation and verification

5. **Logging & Monitoring**
   - Security event logging
   - Rate limit violation tracking
   - Authentication attempt monitoring

### Frontend Security Features

1. **Error Boundaries**
   - React Error Boundary component for graceful error handling
   - Development vs production error display
   - Error logging for debugging

2. **Notification System**
   - Toast notification system for user feedback
   - Error handling for API failures
   - Success/error message display

3. **Environment Configuration**
   - Vite environment variables for API configuration
   - Separate configurations for development/production

## Deployment Instructions

### 1. Environment Setup

#### Backend Environment (.env)
```bash
# Copy and configure backend environment
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
DB_HOST=localhost
DB_NAME=steel_trading
DB_USER=your_db_user
DB_PASS=your_secure_password
JWT_SECRET=your-super-secret-jwt-key-change-this
APP_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

#### Frontend Environment (.env.local)
```bash
# Copy and configure frontend environment
cp .env.example .env.local

# Edit .env.local with your values:
VITE_API_BASE_URL=https://yourdomain.com/backend/api
VITE_APP_ENV=production
VITE_APP_DEBUG=false
```

### 2. Database Setup

```sql
-- Import the database schema
mysql -u your_user -p steel_trading < backend/database/schema.sql
```

### 3. Frontend Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the 'dist' directory
```

### 4. cPanel Deployment

#### File Structure on cPanel:
```
public_html/
├── index.html (from dist/)
├── assets/ (from dist/assets/)
├── backend/
│   ├── api/
│   ├── config/
│   ├── logs/ (create this directory, 755 permissions)
│   └── .htaccess
└── .htaccess
```

#### Backend .htaccess (backend/.htaccess):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Prevent access to sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

#### Root .htaccess (public_html/.htaccess):
```apache
RewriteEngine On

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### 5. File Permissions

```bash
# Set proper permissions
chmod 755 backend/logs/
chmod 644 backend/.env
chmod 644 backend/config/*.php
chmod 644 backend/api/*.php
```

### 6. Testing the Deployment

1. **Frontend Test**: Visit your domain to ensure the React app loads
2. **API Test**: Test API endpoints:
   ```bash
   curl https://yourdomain.com/backend/api/customers
   ```
3. **Authentication Test**: Test login endpoint:
   ```bash
   curl -X POST https://yourdomain.com/backend/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@steeltrading.com","password":"admin123"}'
   ```

## Security Checklist

### Pre-Deployment
- [ ] Change default JWT_SECRET in .env
- [ ] Update CORS_ORIGINS to your domain
- [ ] Set APP_ENV=production
- [ ] Disable APP_DEBUG in production
- [ ] Review database credentials
- [ ] Test all API endpoints
- [ ] Verify error handling works

### Post-Deployment
- [ ] Test login functionality
- [ ] Verify HTTPS is working
- [ ] Check security headers are present
- [ ] Test rate limiting
- [ ] Monitor security logs
- [ ] Test error boundaries
- [ ] Verify environment variables are loaded

## Default Credentials

**Admin Login:**
- Email: admin@steeltrading.com
- Password: admin123

**Important**: Change these credentials immediately after deployment!

## Monitoring & Maintenance

1. **Log Files**: Monitor `backend/logs/` for security events
2. **Rate Limiting**: Check rate limit logs for abuse
3. **Error Logs**: Review application error logs regularly
4. **Security Updates**: Keep dependencies updated
5. **Backup**: Regular database and file backups

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check CORS_ORIGINS in backend .env
2. **Database Connection**: Verify DB credentials in .env
3. **File Permissions**: Ensure logs directory is writable
4. **JWT Errors**: Verify JWT_SECRET is set correctly
5. **API 404 Errors**: Check .htaccess rewrite rules

### Debug Mode:
Set `APP_DEBUG=true` in backend .env for detailed error messages (development only).

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Verify environment configuration
3. Test API endpoints individually
4. Review security event logs