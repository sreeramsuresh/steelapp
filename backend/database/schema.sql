-- Steel Trading Application Database Schema
-- For MySQL/MariaDB

-- Companies table
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    gst_number VARCHAR(50),
    company VARCHAR(255),
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_credit DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer contact history
CREATE TABLE customer_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    type ENUM('call', 'email', 'meeting', 'other') NOT NULL,
    subject VARCHAR(255),
    notes TEXT,
    contact_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category ENUM('rebar', 'structural', 'sheet', 'pipe', 'angle', 'round', 'flat', 'wire') NOT NULL,
    grade VARCHAR(50),
    size VARCHAR(100),
    weight DECIMAL(10,3),
    unit VARCHAR(20) DEFAULT 'kg',
    description TEXT,
    current_stock DECIMAL(15,3) DEFAULT 0.000,
    min_stock DECIMAL(15,3) DEFAULT 10.000,
    max_stock DECIMAL(15,3) DEFAULT 1000.000,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    supplier VARCHAR(255),
    location VARCHAR(255),
    -- Technical specifications
    spec_length VARCHAR(50),
    spec_width VARCHAR(50),
    spec_thickness VARCHAR(50),
    spec_diameter VARCHAR(50),
    spec_tensile_strength VARCHAR(50),
    spec_yield_strength VARCHAR(50),
    spec_carbon_content VARCHAR(50),
    spec_coating VARCHAR(100),
    spec_standard VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product price history
CREATE TABLE product_price_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255),
    effective_date DATE NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    company_id INT DEFAULT 1,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    gst_amount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Invoice items table
CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    product_id INT,
    name VARCHAR(255) NOT NULL,
    specification VARCHAR(255),
    unit VARCHAR(20) DEFAULT 'kg',
    quantity DECIMAL(10,3) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    hsn_code VARCHAR(20),
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert default company
INSERT INTO companies (name, street, city, state, zip_code, phone, email, gst_number) 
VALUES ('Steel Trading Co.', '123 Industrial Area', 'Mumbai', 'Maharashtra', '400001', 
        '+91 9876543210', 'info@steeltrading.com', '27AAAAA0000A1Z5');

-- Sample customers
INSERT INTO customers (name, email, phone, street, city, state, zip_code, company, credit_limit, current_credit, status) VALUES
('ABC Construction Ltd', 'contact@abcconstruction.com', '+91-9876543210', 'Industrial Area', 'Mumbai', 'Maharashtra', '400001', 'ABC Construction Ltd', 500000.00, 125000.00, 'active'),
('XYZ Infrastructure', 'orders@xyzinfra.com', '+91-9876543211', 'Commercial Complex', 'Delhi', 'NCR', '110001', 'XYZ Infrastructure Pvt Ltd', 750000.00, 0.00, 'active');

-- Sample products
INSERT INTO products (name, category, grade, size, weight, unit, description, current_stock, min_stock, max_stock, cost_price, selling_price, supplier, location, spec_length, spec_diameter, spec_tensile_strength, spec_yield_strength, spec_carbon_content, spec_coating, spec_standard) VALUES
('TMT Rebar 12mm', 'rebar', 'Fe415', '12mm', 0.888, 'kg/m', 'High strength TMT rebar for construction', 500, 100, 2000, 45.00, 52.00, 'Steel Corp India', 'Warehouse A', '12m', '12mm', '500 MPa', '415 MPa', '0.25%', 'TMT', 'IS1786:2008'),
('MS Angle 50x50x6', 'angle', 'MS', '50x50x6', 4.5, 'kg/m', 'Mild steel angle for structural applications', 150, 50, 500, 55.00, 63.00, 'Bharat Steel', 'Warehouse B', '6m', '', '410 MPa', '250 MPa', '0.23%', 'None', 'IS2062:2011'),
('Steel Sheet 2mm', 'sheet', 'IS2062', '1200x2400', 45.2, 'kg/sheet', 'Cold rolled steel sheet', 25, 10, 100, 2800.00, 3200.00, 'Sheet Metal Works', 'Warehouse C', '2400mm', '', '410 MPa', '240 MPa', '0.22%', 'Oiled', 'IS2062:2011');

-- Sample price history
INSERT INTO product_price_history (product_id, price, reason, effective_date, updated_by) VALUES
(1, 52.00, 'Market adjustment', '2024-12-10', 'Admin'),
(1, 50.00, 'Seasonal pricing', '2024-11-15', 'Admin'),
(2, 63.00, 'Raw material cost increase', '2024-12-08', 'Admin'),
(3, 3200.00, 'Standard pricing', '2024-12-05', 'Admin');

-- Sample contact history
INSERT INTO customer_contacts (customer_id, type, subject, notes, contact_date) VALUES
(1, 'call', 'Project Discussion', 'Discussed upcoming steel requirements for new project', '2024-12-10');