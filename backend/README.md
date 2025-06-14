# Steel Trading App - PHP Backend API

This is the PHP backend API for the Steel Trading Application, designed to run on cPanel hosting environments with MySQL database support.

## Features

- **Customer Management**: CRUD operations for customers with contact history
- **Product Catalog**: Steel products with specifications, inventory tracking, and pricing
- **Invoice Management**: Create, edit, and track invoices with automatic calculations
- **Analytics**: Sales analytics, revenue trends, and inventory insights
- **RESTful API**: Clean REST endpoints with JSON responses

## API Endpoints

### Customers API (`/api/customers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| GET | `/customers/{id}` | Get specific customer |
| GET | `/customers/analytics` | Get customer analytics |
| GET | `/customers/contacts/{id}` | Get customer contact history |
| POST | `/customers` | Create new customer |
| POST | `/customers/contacts` | Add contact entry |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

### Products API (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/{id}` | Get specific product |
| GET | `/products/analytics` | Get inventory analytics |
| GET | `/products/categories` | Get product categories |
| GET | `/products/price-history/{id}` | Get product price history |
| POST | `/products` | Create new product |
| POST | `/products/update-price` | Update product price |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Invoices API (`/api/invoices`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | Get all invoices |
| GET | `/invoices/{id}` | Get specific invoice |
| GET | `/invoices/analytics` | Get sales analytics |
| GET | `/invoices/revenue-trends` | Get revenue trends |
| GET | `/invoices/generate-number` | Generate new invoice number |
| POST | `/invoices` | Create new invoice |
| PUT | `/invoices/{id}` | Update invoice |
| DELETE | `/invoices/{id}` | Delete invoice |

## Database Schema

### Tables

1. **companies** - Company information
2. **customers** - Customer data with address and credit info
3. **customer_contacts** - Contact history for customers
4. **products** - Steel products with specifications
5. **product_price_history** - Price change tracking
6. **invoices** - Invoice headers
7. **invoice_items** - Invoice line items

### Key Features

- **Referential Integrity**: Foreign key constraints maintain data consistency
- **Automatic Timestamps**: Created/updated timestamps on all records
- **Price History**: Complete audit trail for price changes
- **Flexible Specifications**: Detailed technical specifications for products
- **Status Tracking**: Customer and invoice status management

## Installation

1. **Database Setup:**
   ```sql
   CREATE DATABASE steel_app;
   CREATE USER 'steel_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON steel_app.* TO 'steel_user'@'localhost';
   ```

2. **Import Schema:**
   ```bash
   mysql -u steel_user -p steel_app < database/schema.sql
   ```

3. **Configure Database:**
   - Edit `config/database.php`
   - Update connection credentials

4. **Web Server Setup:**
   - Ensure mod_rewrite is enabled
   - Upload files to web directory
   - Configure .htaccess for routing

## Configuration

### Database Configuration (`config/database.php`)

```php
private $host = 'localhost';
private $db_name = 'steel_app';
private $username = 'steel_user';
private $password = 'your_password';
```

### CORS Configuration

CORS is automatically enabled for all origins. For production, consider restricting to specific domains:

```php
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

## Error Handling

All endpoints return consistent JSON error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Success responses include:

```json
{
  "message": "Success message",
  "data": { ... }
}
```

## Security Features

- **SQL Injection Protection**: All queries use prepared statements
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Detailed error logging without exposing internals
- **CORS Management**: Configurable cross-origin resource sharing

## Development

### Adding New Endpoints

1. Create new function in appropriate API file
2. Add route in switch statement
3. Update .htaccess if needed
4. Test with sample data

### Database Changes

1. Update schema.sql
2. Create migration script if needed
3. Update API functions
4. Test data consistency

## Performance Considerations

- **Database Indexing**: Key fields are indexed for optimal query performance
- **Query Optimization**: Efficient JOIN operations and data retrieval
- **Response Caching**: Consider implementing caching for frequently accessed data
- **Connection Pooling**: Use persistent database connections where possible

## Monitoring and Maintenance

### Logging

Check PHP error logs regularly:
- cPanel Error Logs
- Database query logs
- Application-specific logs

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **File Backups**: Regular file system backups
3. **Version Control**: Keep code in version control

### Performance Monitoring

- Monitor database query performance
- Track API response times
- Monitor disk space usage
- Check for slow queries

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Check credentials in config/database.php
   - Verify database server is running
   - Check user permissions

2. **API Not Found (404):**
   - Verify .htaccess configuration
   - Check mod_rewrite is enabled
   - Confirm file paths

3. **CORS Errors:**
   - Check CORS headers configuration
   - Verify origin URLs
   - Test with browser dev tools

4. **Data Not Saving:**
   - Check input validation
   - Verify database permissions
   - Review error logs

### Debug Mode

Enable PHP error reporting for development:

```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get all customers
curl -X GET https://yourdomain.com/backend/api/customers

# Create new customer
curl -X POST https://yourdomain.com/backend/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@example.com"}'
```

## Version History

- **v1.0**: Initial release with basic CRUD operations
- **v1.1**: Added analytics and reporting features
- **v1.2**: Enhanced security and error handling

## Support

For technical support:
1. Check error logs first
2. Review this documentation
3. Test API endpoints individually
4. Contact system administrator

## License

This backend API is part of the Steel Trading Application. All rights reserved.