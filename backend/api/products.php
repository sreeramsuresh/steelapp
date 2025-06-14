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
            // Get all products
            getAllProducts($db);
        } elseif ($path_parts[0] === 'analytics') {
            // Get inventory analytics
            getInventoryAnalytics($db);
        } elseif ($path_parts[0] === 'categories') {
            // Get product categories
            getProductCategories($db);
        } elseif (is_numeric($path_parts[0])) {
            // Get specific product
            getProduct($db, $path_parts[0]);
        } elseif ($path_parts[0] === 'price-history' && isset($path_parts[1])) {
            // Get product price history
            getProductPriceHistory($db, $path_parts[1]);
        }
        break;
        
    case 'POST':
        if (empty($path_parts[0])) {
            // Create new product
            createProduct($db);
        } elseif ($path_parts[0] === 'update-price') {
            // Update product price
            updateProductPrice($db);
        }
        break;
        
    case 'PUT':
        if (is_numeric($path_parts[0])) {
            // Update product
            updateProduct($db, $path_parts[0]);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($path_parts[0])) {
            // Delete product
            deleteProduct($db, $path_parts[0]);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function getAllProducts($db) {
    try {
        $query = "SELECT p.*, 
                         (SELECT COUNT(*) FROM product_price_history pph WHERE pph.product_id = p.id) as price_history_count
                  FROM products p 
                  ORDER BY p.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll();
        
        // Format products for frontend
        foreach ($products as &$product) {
            $product['specifications'] = [
                'length' => $product['spec_length'],
                'width' => $product['spec_width'],
                'thickness' => $product['spec_thickness'],
                'diameter' => $product['spec_diameter'],
                'tensileStrength' => $product['spec_tensile_strength'],
                'yieldStrength' => $product['spec_yield_strength'],
                'carbonContent' => $product['spec_carbon_content'],
                'coating' => $product['spec_coating'],
                'standard' => $product['spec_standard']
            ];
            
            // Remove spec_ columns from main object
            unset($product['spec_length'], $product['spec_width'], $product['spec_thickness'],
                  $product['spec_diameter'], $product['spec_tensile_strength'], 
                  $product['spec_yield_strength'], $product['spec_carbon_content'],
                  $product['spec_coating'], $product['spec_standard']);
                  
            // Get recent price history
            $price_query = "SELECT * FROM product_price_history 
                           WHERE product_id = ? 
                           ORDER BY effective_date DESC 
                           LIMIT 5";
            $price_stmt = $db->prepare($price_query);
            $price_stmt->execute([$product['id']]);
            $product['priceHistory'] = $price_stmt->fetchAll();
        }
        
        sendSuccess($products);
    } catch (Exception $e) {
        sendError('Failed to fetch products: ' . $e->getMessage(), 500);
    }
}

function getProduct($db, $id) {
    try {
        $query = "SELECT * FROM products WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendError('Product not found', 404);
        }
        
        // Format specifications
        $product['specifications'] = [
            'length' => $product['spec_length'],
            'width' => $product['spec_width'],
            'thickness' => $product['spec_thickness'],
            'diameter' => $product['spec_diameter'],
            'tensileStrength' => $product['spec_tensile_strength'],
            'yieldStrength' => $product['spec_yield_strength'],
            'carbonContent' => $product['spec_carbon_content'],
            'coating' => $product['spec_coating'],
            'standard' => $product['spec_standard']
        ];
        
        // Get price history
        $price_query = "SELECT * FROM product_price_history 
                       WHERE product_id = ? 
                       ORDER BY effective_date DESC";
        $price_stmt = $db->prepare($price_query);
        $price_stmt->execute([$id]);
        $product['priceHistory'] = $price_stmt->fetchAll();
        
        sendSuccess($product);
    } catch (Exception $e) {
        sendError('Failed to fetch product: ' . $e->getMessage(), 500);
    }
}

function createProduct($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO products 
                  (name, category, grade, size, weight, unit, description, 
                   current_stock, min_stock, max_stock, cost_price, selling_price, 
                   supplier, location, spec_length, spec_width, spec_thickness, 
                   spec_diameter, spec_tensile_strength, spec_yield_strength, 
                   spec_carbon_content, spec_coating, spec_standard) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $specs = $input['specifications'] ?? [];
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['name'],
            $input['category'],
            $input['grade'] ?? '',
            $input['size'] ?? '',
            $input['weight'] ?? 0,
            $input['unit'] ?? 'kg',
            $input['description'] ?? '',
            $input['currentStock'] ?? 0,
            $input['minStock'] ?? 10,
            $input['maxStock'] ?? 1000,
            $input['costPrice'] ?? 0,
            $input['sellingPrice'] ?? 0,
            $input['supplier'] ?? '',
            $input['location'] ?? '',
            $specs['length'] ?? '',
            $specs['width'] ?? '',
            $specs['thickness'] ?? '',
            $specs['diameter'] ?? '',
            $specs['tensileStrength'] ?? '',
            $specs['yieldStrength'] ?? '',
            $specs['carbonContent'] ?? '',
            $specs['coating'] ?? '',
            $specs['standard'] ?? ''
        ]);
        
        $product_id = $db->lastInsertId();
        
        // Add initial price history entry
        if (isset($input['sellingPrice']) && $input['sellingPrice'] > 0) {
            $price_query = "INSERT INTO product_price_history 
                           (product_id, price, reason, effective_date, updated_by) 
                           VALUES (?, ?, 'Initial price', CURDATE(), 'Admin')";
            $price_stmt = $db->prepare($price_query);
            $price_stmt->execute([$product_id, $input['sellingPrice']]);
        }
        
        sendSuccess(['id' => $product_id], 'Product created successfully');
        
    } catch (Exception $e) {
        sendError('Failed to create product: ' . $e->getMessage(), 500);
    }
}

function updateProduct($db, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $query = "UPDATE products SET 
                  name = ?, category = ?, grade = ?, size = ?, weight = ?, unit = ?, 
                  description = ?, current_stock = ?, min_stock = ?, max_stock = ?, 
                  cost_price = ?, supplier = ?, location = ?
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['name'],
            $input['category'],
            $input['grade'] ?? '',
            $input['size'] ?? '',
            $input['weight'] ?? 0,
            $input['unit'] ?? 'kg',
            $input['description'] ?? '',
            $input['currentStock'] ?? 0,
            $input['minStock'] ?? 10,
            $input['maxStock'] ?? 1000,
            $input['costPrice'] ?? 0,
            $input['supplier'] ?? '',
            $input['location'] ?? '',
            $id
        ]);
        
        sendSuccess(null, 'Product updated successfully');
        
    } catch (Exception $e) {
        sendError('Failed to update product: ' . $e->getMessage(), 500);
    }
}

function updateProductPrice($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Update product selling price
        $update_query = "UPDATE products SET selling_price = ? WHERE id = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->execute([$input['newPrice'], $input['productId']]);
        
        // Add price history entry
        $history_query = "INSERT INTO product_price_history 
                         (product_id, price, reason, effective_date, updated_by) 
                         VALUES (?, ?, ?, ?, 'Admin')";
        $history_stmt = $db->prepare($history_query);
        $history_stmt->execute([
            $input['productId'],
            $input['newPrice'],
            $input['reason'] ?? 'Price update',
            $input['effectiveDate'] ?? date('Y-m-d')
        ]);
        
        sendSuccess(null, 'Product price updated successfully');
        
    } catch (Exception $e) {
        sendError('Failed to update product price: ' . $e->getMessage(), 500);
    }
}

function deleteProduct($db, $id) {
    try {
        $query = "DELETE FROM products WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendSuccess(null, 'Product deleted successfully');
        } else {
            sendError('Product not found', 404);
        }
        
    } catch (Exception $e) {
        sendError('Failed to delete product: ' . $e->getMessage(), 500);
    }
}

function getProductPriceHistory($db, $product_id) {
    try {
        $query = "SELECT * FROM product_price_history 
                  WHERE product_id = ? 
                  ORDER BY effective_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$product_id]);
        $history = $stmt->fetchAll();
        
        sendSuccess($history);
    } catch (Exception $e) {
        sendError('Failed to fetch price history: ' . $e->getMessage(), 500);
    }
}

function getInventoryAnalytics($db) {
    try {
        // Total products
        $total_query = "SELECT COUNT(*) as total FROM products";
        $total_stmt = $db->prepare($total_query);
        $total_stmt->execute();
        $total_products = $total_stmt->fetch()['total'];
        
        // Low stock products
        $low_stock_query = "SELECT COUNT(*) as low_stock FROM products WHERE current_stock <= min_stock";
        $low_stock_stmt = $db->prepare($low_stock_query);
        $low_stock_stmt->execute();
        $low_stock_products = $low_stock_stmt->fetch()['low_stock'];
        
        // Inventory value and stock
        $value_query = "SELECT 
                        SUM(current_stock * cost_price) as total_value,
                        SUM(current_stock) as total_stock
                        FROM products";
        $value_stmt = $db->prepare($value_query);
        $value_stmt->execute();
        $value_data = $value_stmt->fetch();
        
        $analytics = [
            'totalProducts' => (int)$total_products,
            'lowStockProducts' => (int)$low_stock_products,
            'totalValue' => (float)$value_data['total_value'],
            'totalStock' => (float)$value_data['total_stock']
        ];
        
        sendSuccess($analytics);
    } catch (Exception $e) {
        sendError('Failed to fetch inventory analytics: ' . $e->getMessage(), 500);
    }
}

function getProductCategories($db) {
    $categories = [
        ['value' => 'rebar', 'label' => 'Rebar & Reinforcement'],
        ['value' => 'structural', 'label' => 'Structural Steel'],
        ['value' => 'sheet', 'label' => 'Steel Sheets'],
        ['value' => 'pipe', 'label' => 'Pipes & Tubes'],
        ['value' => 'angle', 'label' => 'Angles & Channels'],
        ['value' => 'round', 'label' => 'Round Bars'],
        ['value' => 'flat', 'label' => 'Flat Bars'],
        ['value' => 'wire', 'label' => 'Wire & Mesh']
    ];
    
    sendSuccess($categories);
}
?>