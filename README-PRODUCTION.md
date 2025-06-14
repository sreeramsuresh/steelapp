# Steel Trading App - Production Deployment

## Pre-Deployment Checklist

### ⚠️ Critical Security Tasks
- [ ] Change all default passwords and secrets
- [ ] Update JWT_SECRET with a secure random string (min 64 characters)
- [ ] Set strong database password
- [ ] Configure CORS_ORIGINS with your actual domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Review all environment variables
- [ ] Test backup and restore procedures

### Environment Configuration

#### 1. Database Setup
```sql
-- Create production database
CREATE DATABASE steel_trading_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user
CREATE USER 'steel_prod'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON steel_trading_prod.* TO 'steel_prod'@'localhost';
FLUSH PRIVILEGES;

-- Import schema
mysql -u steel_prod -p steel_trading_prod < backend/database/schema.sql
```

#### 2. File Permissions
```bash
# Set secure file permissions
chmod 750 backend/
chmod 640 backend/.env
chmod 755 backend/logs/
chmod 644 backend/api/*.php
chmod 644 backend/config/*.php

# Ensure web server can write to logs
chown www-data:www-data backend/logs/
```

#### 3. Environment Files

**Backend (.env)**
```env
# Update with your actual production values
DB_HOST=localhost
DB_NAME=steel_trading_prod
DB_USER=steel_prod
DB_PASS=your_secure_database_password

JWT_SECRET=your_super_secure_64_character_jwt_secret_key_here_change_this
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

APP_ENV=production
APP_DEBUG=false
```

**Frontend (.env.production)**
```env
# Already configured for production
VITE_API_BASE_URL=/backend/api
VITE_APP_ENV=production
VITE_APP_DEBUG=false
```

### Deployment Steps

#### 1. Build Application
```bash
# Switch to production branch
git checkout production

# Install dependencies
npm ci --production

# Build for production
npm run build
```

#### 2. cPanel Deployment Structure
```
public_html/
├── index.html (from dist/)
├── assets/ (from dist/assets/)
├── backend/
│   ├── api/
│   ├── config/
│   ├── database/
│   ├── logs/ (create with 755 permissions)
│   └── .env (copy from .env.production and configure)
├── .htaccess (root)
└── backend/.htaccess
```

#### 3. Apache Configuration

**Root .htaccess (public_html/.htaccess)**
```apache
# Production Security Headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/icon "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/json "access plus 1 hour"
</IfModule>

# React Router
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend
RewriteRule . /index.html [L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Backend .htaccess (backend/.htaccess)**
```apache
# API Routing
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1.php [QSA,L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Hide sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>

# Disable directory browsing
Options -Indexes

# Rate limiting (if mod_security available)
<IfModule mod_security2.c>
    SecRuleEngine On
    SecRule REQUEST_URI "@contains /api/" "id:1001,phase:1,deny,status:429,setvar:ip.requests=+1,expirevar:ip.requests=3600,msg:'Rate limit exceeded'"
</IfModule>
```

### Post-Deployment Verification

#### 1. Functionality Tests
```bash
# Test API endpoints
curl https://yourdomain.com/backend/api/customers
curl https://yourdomain.com/backend/api/products
curl https://yourdomain.com/backend/api/invoices

# Test authentication
curl -X POST https://yourdomain.com/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@steeltrading.com","password":"admin123"}'
```

#### 2. Security Tests
- [ ] Verify HTTPS is working
- [ ] Check security headers are present
- [ ] Test CORS restrictions
- [ ] Verify rate limiting works
- [ ] Test error handling doesn't expose sensitive info

#### 3. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Large file uploads work
- [ ] PDF generation performs well

### Monitoring & Maintenance

#### 1. Log Monitoring
```bash
# Monitor error logs
tail -f backend/logs/app.log
tail -f backend/logs/security.log

# Check web server logs
tail -f /var/log/apache2/error.log
```

#### 2. Database Maintenance
```sql
-- Regular maintenance
OPTIMIZE TABLE customers, products, invoices;
ANALYZE TABLE customers, products, invoices;

-- Monitor database size
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.tables 
WHERE table_schema = 'steel_trading_prod';
```

#### 3. Backup Strategy
```bash
# Daily database backup
mysqldump -u steel_prod -p steel_trading_prod > backup_$(date +%Y%m%d).sql

# Weekly file backup
tar -czf backup_files_$(date +%Y%m%d).tar.gz public_html/

# Retention: Keep daily backups for 7 days, weekly for 4 weeks
```

### SSL Certificate Setup

#### Using Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot --webroot -w /path/to/public_html -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Performance Optimization

#### 1. PHP Optimization
```ini
# php.ini optimizations
memory_limit = 256M
max_execution_time = 30
upload_max_filesize = 10M
post_max_size = 10M
opcache.enable = 1
opcache.memory_consumption = 64
```

#### 2. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_products_category ON products(category);
```

### Troubleshooting

#### Common Issues
1. **Database Connection Errors**
   - Check credentials in .env
   - Verify database user permissions
   - Check database server status

2. **CORS Errors**
   - Verify CORS_ORIGINS in backend/.env
   - Check frontend API URL configuration
   - Ensure protocol (HTTP/HTTPS) matches

3. **File Permission Errors**
   - Check logs directory permissions (755)
   - Verify .env file permissions (640)
   - Ensure web server can read PHP files

4. **SSL Issues**
   - Verify certificate installation
   - Check .htaccess HTTPS redirect
   - Test SSL configuration

### Emergency Procedures

#### Site Maintenance Mode
```html
<!-- Create maintenance.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Site Maintenance</title>
</head>
<body>
    <h1>Site Under Maintenance</h1>
    <p>We'll be back shortly. Thank you for your patience.</p>
</body>
</html>
```

```apache
# Add to .htaccess for maintenance
RewriteEngine On
RewriteCond %{REQUEST_URI} !/maintenance.html$
RewriteRule .* /maintenance.html [R=503,L]
```

#### Rollback Procedure
```bash
# Quick rollback to previous version
git checkout production~1
npm run build
# Re-deploy built files
```

### Production Credentials

**Default Admin Account (CHANGE IMMEDIATELY):**
- Email: `admin@steeltrading.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change this password immediately after deployment!

### Support Contacts

- **Technical Issues**: admin@yourdomain.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Business Hours**: Monday-Friday, 9 AM - 6 PM

This production environment is configured for maximum security, performance, and reliability.