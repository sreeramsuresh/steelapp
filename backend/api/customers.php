<?php
// Add explicit CORS headers first
header("Access-Control-Allow-Origin: http://localhost:3030");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/validator.php';

// Initialize security checks
Security::init();

enableCors();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$path_parts = explode('/', trim($path_info, '/'));

switch ($method) {
    case 'GET':
        if (empty($path_parts[0])) {
            // Get all customers
            getAllCustomers($db);
        } elseif ($path_parts[0] === 'analytics') {
            // Get customer analytics
            getCustomerAnalytics($db);
        } elseif (is_numeric($path_parts[0])) {
            // Get specific customer
            getCustomer($db, $path_parts[0]);
        } elseif ($path_parts[0] === 'contacts' && isset($path_parts[1])) {
            // Get customer contact history
            getCustomerContacts($db, $path_parts[1]);
        }
        break;
        
    case 'POST':
        if (empty($path_parts[0])) {
            // Create new customer
            createCustomer($db);
        } elseif ($path_parts[0] === 'contacts') {
            // Add contact entry
            addContactEntry($db);
        }
        break;
        
    case 'PUT':
        if (is_numeric($path_parts[0])) {
            // Update customer
            updateCustomer($db, $path_parts[0]);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($path_parts[0])) {
            // Delete customer
            deleteCustomer($db, $path_parts[0]);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function getAllCustomers($db) {
    try {
        $query = "SELECT id, name, email, phone, 
                         CONCAT(street, ', ', city, ', ', state) as address,
                         company, credit_limit, current_credit, status, created_at
                  FROM customers 
                  ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $customers = $stmt->fetchAll();
        
        // Add contact history count for each customer
        foreach ($customers as &$customer) {
            $contact_query = "SELECT COUNT(*) as contact_count FROM customer_contacts WHERE customer_id = ?";
            $contact_stmt = $db->prepare($contact_query);
            $contact_stmt->execute([$customer['id']]);
            $contact_result = $contact_stmt->fetch();
            $customer['contact_count'] = $contact_result['contact_count'];
        }
        
        sendSuccess($customers);
    } catch (Exception $e) {
        sendError('Failed to fetch customers: ' . $e->getMessage(), 500);
    }
}

function getCustomer($db, $id) {
    try {
        $query = "SELECT * FROM customers WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $customer = $stmt->fetch();
        
        if (!$customer) {
            sendError('Customer not found', 404);
        }
        
        // Get contact history
        $contact_query = "SELECT * FROM customer_contacts 
                         WHERE customer_id = ? 
                         ORDER BY contact_date DESC";
        $contact_stmt = $db->prepare($contact_query);
        $contact_stmt->execute([$id]);
        $customer['contactHistory'] = $contact_stmt->fetchAll();
        
        sendSuccess($customer);
    } catch (Exception $e) {
        sendError('Failed to fetch customer: ' . $e->getMessage(), 500);
    }
}

function createCustomer($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input data
        $validation = Validator::validateCustomer($input);
        if (!$validation['valid']) {
            sendError('Validation failed: ' . implode(', ', $validation['errors']), 400);
            return;
        }
        
        $query = "INSERT INTO customers 
                  (name, email, phone, street, city, state, zip_code, company, 
                   credit_limit, current_credit, status, gst_number) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['name'],
            $input['email'] ?? '',
            $input['phone'] ?? '',
            $input['address'] ?? '',
            $input['city'] ?? '',
            $input['state'] ?? '',
            $input['zipCode'] ?? '',
            $input['company'] ?? '',
            $input['creditLimit'] ?? 0,
            $input['currentCredit'] ?? 0,
            $input['status'] ?? 'active',
            $input['gstNumber'] ?? ''
        ]);
        
        $customer_id = $db->lastInsertId();
        
        // Log security event
        Security::logSecurityEvent('customer_created', ['customer_id' => $customer_id]);
        
        sendSuccess(['id' => $customer_id], 'Customer created successfully');
        
    } catch (Exception $e) {
        Security::logSecurityEvent('customer_creation_failed', ['error' => $e->getMessage()]);
        sendError('Failed to create customer: ' . $e->getMessage(), 500);
    }
}

function updateCustomer($db, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input data
        $validation = Validator::validateCustomer($input);
        if (!$validation['valid']) {
            sendError('Validation failed: ' . implode(', ', $validation['errors']), 400);
            return;
        }
        
        // Validate ID
        if (!Validator::validatePositiveInteger($id)) {
            sendError('Invalid customer ID', 400);
            return;
        }
        
        $query = "UPDATE customers SET 
                  name = ?, email = ?, phone = ?, street = ?, city = ?, state = ?, 
                  zip_code = ?, company = ?, credit_limit = ?, current_credit = ?, 
                  status = ?, gst_number = ?
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['name'],
            $input['email'] ?? '',
            $input['phone'] ?? '',
            $input['address'] ?? '',
            $input['city'] ?? '',
            $input['state'] ?? '',
            $input['zipCode'] ?? '',
            $input['company'] ?? '',
            $input['creditLimit'] ?? 0,
            $input['currentCredit'] ?? 0,
            $input['status'] ?? 'active',
            $input['gstNumber'] ?? '',
            $id
        ]);
        
        // Log security event
        Security::logSecurityEvent('customer_updated', ['customer_id' => $id]);
        
        sendSuccess(null, 'Customer updated successfully');
        
    } catch (Exception $e) {
        Security::logSecurityEvent('customer_update_failed', ['customer_id' => $id, 'error' => $e->getMessage()]);
        sendError('Failed to update customer: ' . $e->getMessage(), 500);
    }
}

function deleteCustomer($db, $id) {
    try {
        $query = "DELETE FROM customers WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendSuccess(null, 'Customer deleted successfully');
        } else {
            sendError('Customer not found', 404);
        }
        
    } catch (Exception $e) {
        sendError('Failed to delete customer: ' . $e->getMessage(), 500);
    }
}

function getCustomerContacts($db, $customer_id) {
    try {
        $query = "SELECT * FROM customer_contacts 
                  WHERE customer_id = ? 
                  ORDER BY contact_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$customer_id]);
        $contacts = $stmt->fetchAll();
        
        sendSuccess($contacts);
    } catch (Exception $e) {
        sendError('Failed to fetch contact history: ' . $e->getMessage(), 500);
    }
}

function addContactEntry($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO customer_contacts 
                  (customer_id, type, subject, notes, contact_date) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['customer_id'],
            $input['type'],
            $input['subject'],
            $input['notes'],
            $input['date']
        ]);
        
        $contact_id = $db->lastInsertId();
        sendSuccess(['id' => $contact_id], 'Contact entry added successfully');
        
    } catch (Exception $e) {
        sendError('Failed to add contact entry: ' . $e->getMessage(), 500);
    }
}

function getCustomerAnalytics($db) {
    try {
        // Total customers
        $total_query = "SELECT COUNT(*) as total FROM customers";
        $total_stmt = $db->prepare($total_query);
        $total_stmt->execute();
        $total_customers = $total_stmt->fetch()['total'];
        
        // Active customers
        $active_query = "SELECT COUNT(*) as active FROM customers WHERE status = 'active'";
        $active_stmt = $db->prepare($active_query);
        $active_stmt->execute();
        $active_customers = $active_stmt->fetch()['active'];
        
        // Credit analytics
        $credit_query = "SELECT 
                        SUM(credit_limit) as total_credit_limit,
                        SUM(current_credit) as total_credit_used
                        FROM customers";
        $credit_stmt = $db->prepare($credit_query);
        $credit_stmt->execute();
        $credit_data = $credit_stmt->fetch();
        
        $analytics = [
            'totalCustomers' => (int)$total_customers,
            'activeCustomers' => (int)$active_customers,
            'totalCreditLimit' => (float)$credit_data['total_credit_limit'],
            'totalCreditUsed' => (float)$credit_data['total_credit_used'],
            'availableCredit' => (float)($credit_data['total_credit_limit'] - $credit_data['total_credit_used']),
            'avgCreditUtilization' => $credit_data['total_credit_limit'] > 0 ? 
                (($credit_data['total_credit_used'] / $credit_data['total_credit_limit']) * 100) : 0
        ];
        
        sendSuccess($analytics);
    } catch (Exception $e) {
        sendError('Failed to fetch analytics: ' . $e->getMessage(), 500);
    }
}
?>