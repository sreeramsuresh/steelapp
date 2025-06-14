<?php
// Add CORS headers immediately for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set content type for API responses
header("Content-Type: application/json");

// Get the request URI and remove query string
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove leading slash and split into parts
$path_parts = explode('/', trim($request_uri, '/'));

// Only handle API requests - reject anything that's not an API call
if (!isset($path_parts[0]) || $path_parts[0] !== 'api') {
    http_response_code(404);
    echo json_encode(['error' => 'Not an API endpoint']);
    exit;
}

// Check if this is an API request
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    // Route to appropriate API file
    if (isset($path_parts[1])) {
        switch ($path_parts[1]) {
            case 'customers':
                echo json_encode([]);
                break;
            case 'products':
                echo json_encode([]);
                break;
            case 'invoices':
                // Handle specific invoice endpoints
                if (isset($path_parts[2]) && $path_parts[2] === 'generate-number') {
                    echo json_encode(['invoice_number' => 'INV-' . date('Ymd') . '-001']);
                } else {
                    echo json_encode([]);
                }
                break;
            default:
                http_response_code(404);
                echo json_encode(['error' => 'API endpoint not found']);
                break;
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not specified']);
    }
} else {
    // Not an API request
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>