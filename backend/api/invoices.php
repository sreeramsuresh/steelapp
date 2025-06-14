<?php
require_once '../config/database.php';

enableCors();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$path_parts = explode('/', trim($path_info, '/'));

switch ($method) {
    case 'GET':
        if (empty($path_parts[0])) {
            // Get all invoices
            getAllInvoices($db);
        } elseif ($path_parts[0] === 'analytics') {
            // Get sales analytics
            getSalesAnalytics($db);
        } elseif ($path_parts[0] === 'revenue-trends') {
            // Get revenue trends
            getRevenueTrends($db);
        } elseif (is_numeric($path_parts[0])) {
            // Get specific invoice
            getInvoice($db, $path_parts[0]);
        } elseif ($path_parts[0] === 'generate-number') {
            // Generate new invoice number
            generateInvoiceNumber($db);
        }
        break;
        
    case 'POST':
        if (empty($path_parts[0])) {
            // Create new invoice
            createInvoice($db);
        }
        break;
        
    case 'PUT':
        if (is_numeric($path_parts[0])) {
            // Update invoice
            updateInvoice($db, $path_parts[0]);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($path_parts[0])) {
            // Delete invoice
            deleteInvoice($db, $path_parts[0]);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function getAllInvoices($db) {
    try {
        $query = "SELECT i.*, c.name as customer_name, c.company as customer_company
                  FROM invoices i
                  LEFT JOIN customers c ON i.customer_id = c.id
                  ORDER BY i.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $invoices = $stmt->fetchAll();
        
        sendSuccess($invoices);
    } catch (Exception $e) {
        sendError('Failed to fetch invoices: ' . $e->getMessage(), 500);
    }
}

function getInvoice($db, $id) {
    try {
        // Get invoice with customer details
        $query = "SELECT i.*, c.*, comp.name as company_name, comp.street as company_street,
                         comp.city as company_city, comp.state as company_state, 
                         comp.zip_code as company_zip, comp.phone as company_phone,
                         comp.email as company_email, comp.gst_number as company_gst
                  FROM invoices i
                  LEFT JOIN customers c ON i.customer_id = c.id
                  LEFT JOIN companies comp ON i.company_id = comp.id
                  WHERE i.id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $invoice = $stmt->fetch();
        
        if (!$invoice) {
            sendError('Invoice not found', 404);
        }
        
        // Get invoice items
        $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
        $items_stmt = $db->prepare($items_query);
        $items_stmt->execute([$id]);
        $items = $items_stmt->fetchAll();
        
        // Format the response
        $response = [
            'id' => $invoice['id'],
            'invoiceNumber' => $invoice['invoice_number'],
            'date' => $invoice['invoice_date'],
            'dueDate' => $invoice['due_date'],
            'subtotal' => (float)$invoice['subtotal'],
            'gstAmount' => (float)$invoice['gst_amount'],
            'total' => (float)$invoice['total'],
            'status' => $invoice['status'],
            'notes' => $invoice['notes'],
            'terms' => $invoice['terms'],
            'customer' => [
                'id' => $invoice['customer_id'],
                'name' => $invoice['name'],
                'email' => $invoice['email'],
                'phone' => $invoice['phone'],
                'company' => $invoice['company'],
                'gstNumber' => $invoice['gst_number'],
                'address' => [
                    'street' => $invoice['street'],
                    'city' => $invoice['city'],
                    'state' => $invoice['state'],
                    'zipCode' => $invoice['zip_code']
                ]
            ],
            'company' => [
                'name' => $invoice['company_name'],
                'address' => [
                    'street' => $invoice['company_street'],
                    'city' => $invoice['company_city'],
                    'state' => $invoice['company_state'],
                    'zipCode' => $invoice['company_zip']
                ],
                'phone' => $invoice['company_phone'],
                'email' => $invoice['company_email'],
                'gstNumber' => $invoice['company_gst']
            ],
            'items' => $items
        ];
        
        sendSuccess($response);
    } catch (Exception $e) {
        sendError('Failed to fetch invoice: ' . $e->getMessage(), 500);
    }
}

function createInvoice($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $db->beginTransaction();
        
        // Create/get customer
        $customer_id = createOrGetCustomer($db, $input['customer']);
        
        // Create invoice
        $invoice_query = "INSERT INTO invoices 
                         (invoice_number, customer_id, company_id, invoice_date, due_date, 
                          subtotal, gst_amount, total, status, notes, terms) 
                         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $invoice_stmt = $db->prepare($invoice_query);
        $invoice_stmt->execute([
            $input['invoiceNumber'],
            $customer_id,
            $input['date'],
            $input['dueDate'],
            $input['subtotal'],
            $input['gstAmount'],
            $input['total'],
            $input['status'] ?? 'draft',
            $input['notes'] ?? '',
            $input['terms'] ?? ''
        ]);
        
        $invoice_id = $db->lastInsertId();
        
        // Create invoice items
        foreach ($input['items'] as $item) {
            $item_query = "INSERT INTO invoice_items 
                          (invoice_id, name, specification, unit, quantity, rate, 
                           amount, hsn_code, gst_rate) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $item_stmt = $db->prepare($item_query);
            $item_stmt->execute([
                $invoice_id,
                $item['name'],
                $item['specification'] ?? '',
                $item['unit'],
                $item['quantity'],
                $item['rate'],
                $item['amount'],
                $item['hsnCode'] ?? '',
                $item['gstRate']
            ]);
        }
        
        $db->commit();
        sendSuccess(['id' => $invoice_id], 'Invoice created successfully');
        
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to create invoice: ' . $e->getMessage(), 500);
    }
}

function updateInvoice($db, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $db->beginTransaction();
        
        // Update customer
        $customer_id = createOrGetCustomer($db, $input['customer']);
        
        // Update invoice
        $invoice_query = "UPDATE invoices SET 
                         invoice_number = ?, customer_id = ?, invoice_date = ?, 
                         due_date = ?, subtotal = ?, gst_amount = ?, total = ?, 
                         status = ?, notes = ?, terms = ?
                         WHERE id = ?";
        
        $invoice_stmt = $db->prepare($invoice_query);
        $invoice_stmt->execute([
            $input['invoiceNumber'],
            $customer_id,
            $input['date'],
            $input['dueDate'],
            $input['subtotal'],
            $input['gstAmount'],
            $input['total'],
            $input['status'] ?? 'draft',
            $input['notes'] ?? '',
            $input['terms'] ?? '',
            $id
        ]);
        
        // Delete existing items
        $delete_items_query = "DELETE FROM invoice_items WHERE invoice_id = ?";
        $delete_items_stmt = $db->prepare($delete_items_query);
        $delete_items_stmt->execute([$id]);
        
        // Create new invoice items
        foreach ($input['items'] as $item) {
            $item_query = "INSERT INTO invoice_items 
                          (invoice_id, name, specification, unit, quantity, rate, 
                           amount, hsn_code, gst_rate) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $item_stmt = $db->prepare($item_query);
            $item_stmt->execute([
                $id,
                $item['name'],
                $item['specification'] ?? '',
                $item['unit'],
                $item['quantity'],
                $item['rate'],
                $item['amount'],
                $item['hsnCode'] ?? '',
                $item['gstRate']
            ]);
        }
        
        $db->commit();
        sendSuccess(null, 'Invoice updated successfully');
        
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to update invoice: ' . $e->getMessage(), 500);
    }
}

function deleteInvoice($db, $id) {
    try {
        $query = "DELETE FROM invoices WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendSuccess(null, 'Invoice deleted successfully');
        } else {
            sendError('Invoice not found', 404);
        }
        
    } catch (Exception $e) {
        sendError('Failed to delete invoice: ' . $e->getMessage(), 500);
    }
}

function generateInvoiceNumber($db) {
    try {
        $year = date('y');
        $month = date('m');
        
        // Get the latest invoice number for this month
        $query = "SELECT invoice_number FROM invoices 
                  WHERE invoice_number LIKE ? 
                  ORDER BY invoice_number DESC 
                  LIMIT 1";
        
        $pattern = "INV-{$year}{$month}-%";
        $stmt = $db->prepare($query);
        $stmt->execute([$pattern]);
        $result = $stmt->fetch();
        
        if ($result) {
            // Extract the sequence number and increment
            $last_number = $result['invoice_number'];
            $parts = explode('-', $last_number);
            $sequence = intval(substr($parts[2], 0)) + 1;
        } else {
            $sequence = 1;
        }
        
        $invoice_number = sprintf("INV-%s%s-%03d", $year, $month, $sequence);
        
        sendSuccess(['invoiceNumber' => $invoice_number]);
        
    } catch (Exception $e) {
        sendError('Failed to generate invoice number: ' . $e->getMessage(), 500);
    }
}

function createOrGetCustomer($db, $customer_data) {
    // Check if customer exists by email or name
    $check_query = "SELECT id FROM customers WHERE email = ? OR name = ? LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$customer_data['email'], $customer_data['name']]);
    $existing = $check_stmt->fetch();
    
    if ($existing) {
        return $existing['id'];
    }
    
    // Create new customer
    $create_query = "INSERT INTO customers 
                    (name, email, phone, street, city, state, zip_code, gst_number) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $create_stmt = $db->prepare($create_query);
    $create_stmt->execute([
        $customer_data['name'],
        $customer_data['email'] ?? '',
        $customer_data['phone'] ?? '',
        $customer_data['address']['street'] ?? '',
        $customer_data['address']['city'] ?? '',
        $customer_data['address']['state'] ?? '',
        $customer_data['address']['zipCode'] ?? '',
        $customer_data['gstNumber'] ?? ''
    ]);
    
    return $db->lastInsertId();
}

function getSalesAnalytics($db) {
    try {
        // Total invoices
        $total_query = "SELECT COUNT(*) as total FROM invoices";
        $total_stmt = $db->prepare($total_query);
        $total_stmt->execute();
        $total_invoices = $total_stmt->fetch()['total'];
        
        // Revenue this month
        $month_query = "SELECT SUM(total) as monthly_revenue 
                       FROM invoices 
                       WHERE MONTH(invoice_date) = MONTH(CURDATE()) 
                       AND YEAR(invoice_date) = YEAR(CURDATE())";
        $month_stmt = $db->prepare($month_query);
        $month_stmt->execute();
        $monthly_revenue = $month_stmt->fetch()['monthly_revenue'] ?? 0;
        
        // Pending invoices
        $pending_query = "SELECT COUNT(*) as pending FROM invoices WHERE status IN ('draft', 'sent')";
        $pending_stmt = $db->prepare($pending_query);
        $pending_stmt->execute();
        $pending_invoices = $pending_stmt->fetch()['pending'];
        
        // Total revenue
        $revenue_query = "SELECT SUM(total) as total_revenue FROM invoices WHERE status = 'paid'";
        $revenue_stmt = $db->prepare($revenue_query);
        $revenue_stmt->execute();
        $total_revenue = $revenue_stmt->fetch()['total_revenue'] ?? 0;
        
        $analytics = [
            'totalInvoices' => (int)$total_invoices,
            'monthlyRevenue' => (float)$monthly_revenue,
            'pendingInvoices' => (int)$pending_invoices,
            'totalRevenue' => (float)$total_revenue
        ];
        
        sendSuccess($analytics);
    } catch (Exception $e) {
        sendError('Failed to fetch sales analytics: ' . $e->getMessage(), 500);
    }
}

function getRevenueTrends($db) {
    try {
        // Monthly revenue for the last 12 months
        $query = "SELECT 
                    DATE_FORMAT(invoice_date, '%Y-%m') as month,
                    SUM(total) as revenue,
                    COUNT(*) as invoice_count
                  FROM invoices 
                  WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                  GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
                  ORDER BY month";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $trends = $stmt->fetchAll();
        
        sendSuccess($trends);
    } catch (Exception $e) {
        sendError('Failed to fetch revenue trends: ' . $e->getMessage(), 500);
    }
}
?>