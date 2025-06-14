# Steel Trading App - UAT Environment

## User Acceptance Testing Guide

### Purpose
This UAT environment is designed for:
- User acceptance testing by stakeholders
- Performance testing under production-like conditions
- Final validation before production deployment
- Training users on the new system

### Environment Details

**UAT Server:** https://uat.steeltrading.com  
**Admin Panel:** https://uat-admin.steeltrading.com  
**API Endpoint:** https://uat.steeltrading.com/backend/api/

### Test Credentials

#### Admin Users
- **Primary Admin**
  - Email: `admin@steeltrading.com`
  - Password: `admin123`
  - Role: Full Access

- **Manager**
  - Email: `manager@steeltrading.com`
  - Password: `manager123`
  - Role: Customer & Invoice Management

- **User**
  - Email: `user@steeltrading.com`
  - Password: `user123`
  - Role: Read-only Access

### Features to Test

#### 1. Customer Management
- [ ] Add new customers
- [ ] Edit customer information
- [ ] Search and filter customers
- [ ] View customer history
- [ ] Delete customers
- [ ] Import customer data

#### 2. Product Management
- [ ] Add steel products
- [ ] Update product prices
- [ ] Manage product categories
- [ ] Track price history
- [ ] View product analytics

#### 3. Invoice System
- [ ] Create new invoices
- [ ] Add multiple items to invoice
- [ ] Apply discounts and taxes
- [ ] Generate PDF invoices
- [ ] Save drafts
- [ ] Send invoices via email
- [ ] Track invoice status

#### 4. Analytics & Reports
- [ ] View sales dashboard
- [ ] Revenue trend analysis
- [ ] Customer analytics
- [ ] Product performance reports
- [ ] Export reports to CSV/PDF

#### 5. Calculator Tools
- [ ] Steel weight calculations
- [ ] Price calculations
- [ ] Cost estimations
- [ ] Material requirements

#### 6. System Features
- [ ] User authentication
- [ ] Role-based permissions
- [ ] Data export/import
- [ ] System notifications
- [ ] Error handling

### Testing Scenarios

#### Scenario 1: New Customer Order
1. Login as Manager
2. Add a new customer
3. Create a new invoice for the customer
4. Add multiple steel products
5. Apply discount
6. Generate and download PDF
7. Mark invoice as sent

#### Scenario 2: Product Price Update
1. Login as Admin
2. Navigate to Products
3. Update product price
4. Verify price history is tracked
5. Check impact on pending invoices

#### Scenario 3: Analytics Review
1. Login as Admin
2. View sales dashboard
3. Analyze revenue trends
4. Export monthly report
5. Review customer analytics

#### Scenario 4: User Permissions
1. Login as User (read-only)
2. Try to create/edit data
3. Verify proper restrictions
4. Test access to different sections

### Data for Testing

The UAT environment includes:
- 50 sample customers
- 100+ steel products with categories
- Historical invoices (6 months)
- Sample analytics data
- Test price history

### Performance Testing

#### Expected Performance
- Page load time: < 3 seconds
- API response time: < 1 second
- PDF generation: < 5 seconds
- Search results: < 2 seconds

#### Load Testing
- Test with 10+ concurrent users
- Bulk operations (100+ records)
- Large file uploads
- Extended sessions

### Issue Reporting

#### How to Report Issues
1. **Critical Issues**: Email immediately to dev@steeltrading.com
2. **Non-Critical**: Use the feedback form in the app
3. **Feature Requests**: Add to UAT feedback document

#### Issue Information to Include
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/screen recordings
- Browser and device information
- User account used
- Timestamp of issue

### Known Limitations (UAT Only)
- Email functionality uses test SMTP
- Payment integrations are in sandbox mode
- Some advanced features may be disabled
- Data is reset weekly

### UAT Schedule

#### Phase 1: Core Functionality (Week 1)
- Customer & Product Management
- Basic Invoice Creation
- User Authentication

#### Phase 2: Advanced Features (Week 2)
- Analytics & Reports
- Calculator Tools
- Email Integration

#### Phase 3: Performance & Integration (Week 3)
- Load Testing
- End-to-end Workflows
- Integration Testing

#### Phase 4: Final Validation (Week 4)
- Bug Fixes Validation
- User Training
- Production Readiness Review

### Success Criteria

#### Functional Requirements
- [ ] All core features work as expected
- [ ] No critical bugs identified
- [ ] User acceptance confirmed by stakeholders
- [ ] Performance meets requirements

#### Non-Functional Requirements
- [ ] System is stable under normal load
- [ ] Security measures are effective
- [ ] User interface is intuitive
- [ ] Data integrity is maintained

### Deployment to UAT

#### For Developers
```bash
# Switch to UAT branch
git checkout uat

# Build for UAT
npm run build

# Deploy to UAT server
# (Follow UAT deployment instructions)
```

#### UAT Environment Configuration
- Production-like security settings
- Moderate rate limiting
- Full error logging
- Performance monitoring enabled
- User feedback collection enabled

### Support During UAT

**UAT Support Team:**
- Technical Lead: Available 9 AM - 6 PM
- QA Lead: Available 10 AM - 7 PM
- Business Analyst: Available 9 AM - 5 PM

**Response Times:**
- Critical Issues: 2 hours
- High Priority: 4 hours
- Medium Priority: 24 hours
- Low Priority: 48 hours

This UAT environment provides a safe, production-like space for thorough testing before the final production deployment.