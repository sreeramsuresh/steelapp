<?php
// Production router for Railway deployment
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in production

// Set content type and CORS headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Serve static files (built React app)
if (preg_match('/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/', $path)) {
    return false; // Let PHP serve static files normally
}

// API routing
if (strpos($path, '/api/') === 0) {
    // Remove /api prefix
    $api_path = substr($path, 4);
    $path_parts = explode('/', trim($api_path, '/'));
    
    if (empty($path_parts[0])) {
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not specified']);
        exit;
    }
    
    switch ($path_parts[0]) {
        case 'customers':
            echo json_encode([]);
            break;
        case 'products':
            echo json_encode([]);
            break;
        case 'invoices':
            if (isset($path_parts[1]) && $path_parts[1] === 'generate-number') {
                echo json_encode(['invoice_number' => 'INV-' . date('Ymd') . '-' . rand(100, 999)]);
            } else {
                echo json_encode([]);
            }
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
            break;
    }
    exit;
}

// Serve React app for all other routes
$indexPath = __DIR__ . '/index.html';
if (file_exists($indexPath)) {
    readfile($indexPath);
} else {
    // Fallback HTML if build doesn't exist
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Steel Trading App</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <div id="root">
            <h1>Steel Trading App</h1>
            <p>Application is starting...</p>
        </div>
    </body>
    </html>';
}
?>