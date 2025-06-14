# Steel Trading App - cPanel Deployment Guide

This guide will help you deploy the React Steel Trading application with PHP backend to a cPanel hosting environment.

## Prerequisites

- cPanel hosting account with PHP 7.4+ and MySQL support
- Domain or subdomain configured
- SSH access (optional but recommended)
- File Manager access through cPanel

## Deployment Steps

### 1. Database Setup

1. **Create MySQL Database:**
   - Login to cPanel
   - Navigate to "MySQL Databases"
   - Create a new database: `steel_app`
   - Create a new user: `steel_user` with a strong password
   - Grant ALL privileges to the user for the database

2. **Import Database Schema:**
   - Open phpMyAdmin from cPanel
   - Select your `steel_app` database
   - Go to "Import" tab
   - Upload and execute the `backend/database/schema.sql` file

3. **Update Database Configuration:**
   - Edit `backend/config/database.php`
   - Update the database credentials:
     ```php
     private $host = 'localhost';
     private $db_name = 'your_cpanel_username_steel_app';
     private $username = 'your_cpanel_username_steel_user';
     private $password = 'your_database_password';
     ```

### 2. Backend Deployment

1. **Upload Backend Files:**
   - Create a folder named `backend` in your domain's public_html directory
   - Upload all files from the `backend/` folder to this directory
   - Ensure the folder structure is:
     ```
     public_html/
     ├── backend/
     │   ├── api/
     │   │   ├── customers.php
     │   │   ├── products.php
     │   │   └── invoices.php
     │   ├── config/
     │   │   └── database.php
     │   ├── database/
     │   │   └── schema.sql
     │   └── .htaccess
     ```

2. **Set Permissions:**
   - Set folder permissions to 755
   - Set file permissions to 644

3. **Test Backend API:**
   - Visit: `https://yourdomain.com/backend/api/customers`
   - You should receive a JSON response with sample customer data

### 3. Frontend Deployment

1. **Build the React Application:**
   ```bash
   # In your local development environment
   cd steelapp
   npm run build
   ```

2. **Upload Built Files:**
   - Upload the contents of the `dist/` folder to your domain's `public_html` directory
   - Your structure should look like:
     ```
     public_html/
     ├── backend/          (API files)
     ├── assets/           (CSS, JS, images)
     ├── index.html        (Main app file)
     └── vite.svg
     ```

3. **Configure Routing:**
   - Create/update `.htaccess` in public_html root:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       
       # Handle Angular and other frontend routes
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_URI} !^/backend
       RewriteRule . /index.html [L]
       
       # Enable CORS for API
       Header always set Access-Control-Allow-Origin "*"
       Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
       Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
     </IfModule>
     ```

### 4. SSL Configuration (Recommended)

1. **Enable SSL Certificate:**
   - Go to cPanel > SSL/TLS
   - Request a free Let's Encrypt certificate
   - Or upload your own SSL certificate

2. **Force HTTPS:**
   - Add to your `.htaccess` file:
     ```apache
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     ```

### 5. Environment Configuration

1. **Production Environment:**
   - The app will automatically detect production environment
   - API calls will use relative paths (`/backend/api`)

2. **Update Base URL (if needed):**
   - If deploying to a subdirectory, update `src/config/api.js`:
     ```javascript
     const API_BASE_URL = process.env.NODE_ENV === 'production' 
       ? '/subdirectory/backend/api'  // Update this path
       : 'http://localhost/backend/api';
     ```

### 6. Testing the Deployment

1. **Frontend Test:**
   - Visit your domain: `https://yourdomain.com`
   - Verify the application loads correctly
   - Test navigation between pages

2. **Backend Test:**
   - Test API endpoints:
     - `https://yourdomain.com/backend/api/customers`
     - `https://yourdomain.com/backend/api/products`
     - `https://yourdomain.com/backend/api/invoices`

3. **Full Integration Test:**
   - Create a new customer
   - Add a new product
   - Create an invoice
   - Generate a PDF

### 7. Troubleshooting

**Common Issues:**

1. **500 Internal Server Error:**
   - Check PHP error logs in cPanel
   - Verify file permissions
   - Ensure PHP version is 7.4+

2. **Database Connection Error:**
   - Verify database credentials
   - Check if database exists
   - Ensure user has correct privileges

3. **CORS Errors:**
   - Verify .htaccess files are properly configured
   - Check if mod_rewrite is enabled

4. **API Not Found (404):**
   - Verify .htaccess file in backend folder
   - Check file paths and names
   - Ensure mod_rewrite is enabled

5. **White Screen/App Not Loading:**
   - Check browser console for errors
   - Verify all assets are uploaded
   - Check .htaccess routing rules

### 8. Performance Optimization

1. **Enable Gzip Compression:**
   ```apache
   # Add to .htaccess
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
   ```

2. **Browser Caching:**
   ```apache
   # Add to .htaccess
   <IfModule mod_expires.c>
     ExpiresActive on
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

### 9. Security Considerations

1. **Database Security:**
   - Use strong passwords
   - Limit database user privileges
   - Regular backups

2. **File Security:**
   - Protect sensitive files
   - Regular updates
   - Monitor access logs

3. **API Security:**
   - Consider implementing authentication
   - Rate limiting
   - Input validation

### 10. Maintenance

1. **Regular Backups:**
   - Database backups
   - File backups
   - Test restore procedures

2. **Updates:**
   - Monitor for security updates
   - Test updates in staging environment
   - Keep dependencies updated

3. **Monitoring:**
   - Monitor error logs
   - Track performance metrics
   - Monitor disk space usage

## Support

For additional support or custom modifications:
- Check cPanel documentation
- Contact your hosting provider
- Review PHP and MySQL logs for specific errors

## File Structure Summary

```
public_html/
├── backend/
│   ├── api/
│   │   ├── customers.php
│   │   ├── products.php
│   │   └── invoices.php
│   ├── config/
│   │   └── database.php
│   ├── database/
│   │   └── schema.sql
│   └── .htaccess
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
├── index.html
├── .htaccess
└── vite.svg
```

Your Steel Trading Application should now be successfully deployed and accessible via your domain!