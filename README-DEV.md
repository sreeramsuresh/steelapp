# Steel Trading App - Development Environment

## Quick Setup for Development

### Prerequisites
- Node.js (v16+)
- PHP (v7.4+) 
- MySQL/XAMPP/WAMP
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd steelapp

# Switch to development branch
git checkout development

# Install frontend dependencies
npm install
```

### 2. Database Setup

```bash
# Create development database
mysql -u root -p -e "CREATE DATABASE steel_trading_dev;"

# Import schema
mysql -u root -p steel_trading_dev < backend/database/schema.sql
```

### 3. Environment Configuration

#### Backend Setup
```bash
# Copy development environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your local database credentials:
DB_HOST=localhost
DB_NAME=steel_trading_dev
DB_USER=root
DB_PASS=your_mysql_password
```

#### Frontend Setup
```bash
# The .env.development file is already configured
# Ensure your API URL matches your local PHP server
```

### 4. Start Development Servers

#### Option A: Using XAMPP/WAMP
1. Start XAMPP/WAMP
2. Copy project to htdocs/www folder
3. Access API at: `http://localhost/steelapp/backend/api/`

#### Option B: PHP Built-in Server
```bash
# Start PHP server for API
cd backend
php -S localhost:8000

# Start frontend development server (in new terminal)
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost/steelapp/backend/api/ (or http://localhost:8000/api/)

### Default Development Credentials

**Admin Login:**
- Email: `admin@steeltrading.com`
- Password: `admin123`

### Development Features Enabled

- ✅ Debug mode enabled
- ✅ Verbose logging
- ✅ SQL query logging
- ✅ Hot reload
- ✅ Development tools
- ✅ Relaxed rate limiting
- ✅ Permissive CORS
- ✅ Console logging
- ✅ Error stack traces

### Development Scripts

```bash
# Start development server
npm run dev

# Build for testing
npm run build

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

### Testing Features

#### Manual Testing Checklist
- [ ] Customer CRUD operations
- [ ] Product management
- [ ] Invoice creation and PDF generation
- [ ] Analytics dashboards
- [ ] Authentication system
- [ ] Error handling
- [ ] Responsive design

#### API Testing
```bash
# Test API endpoints
curl http://localhost:8000/api/customers
curl http://localhost:8000/api/products
curl http://localhost:8000/api/invoices

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@steeltrading.com","password":"admin123"}'
```

### Development Database

The development environment uses a separate database (`steel_trading_dev`) to avoid conflicts with other environments.

### Debug Information

#### View Logs
```bash
# Backend logs
tail -f backend/logs/app.log
tail -f backend/logs/security.log

# Check rate limiting
cat backend/logs/rate_limit.json
```

#### Database Queries
When `ENABLE_QUERY_LOG=true`, all SQL queries are logged to help with debugging.

### Common Development Issues

#### CORS Errors
- Check that your frontend URL is in `CORS_ORIGINS` in backend/.env
- Verify the API URL in .env.development

#### Database Connection
- Ensure MySQL is running
- Check database credentials in backend/.env
- Verify database exists

#### Port Conflicts
```bash
# Use different port for frontend
npm run dev -- --port 3000

# Update CORS_ORIGINS accordingly
```

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Test changes thoroughly

### Git Workflow

```bash
# Create feature branch from development
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request to development branch
```

This development branch is configured for:
- Easy local setup
- Comprehensive debugging
- Fast development cycles
- Safe testing environment