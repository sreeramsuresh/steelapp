<?php
// Handle CORS for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the API endpoint from the URL
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($request_uri, '/'));

// Remove 'cors.php' from the path
array_shift($path_parts);

if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    // Route to appropriate API file
    if (isset($path_parts[1])) {
        switch ($path_parts[1]) {
            case 'customers':
                $_SERVER['PATH_INFO'] = '/' . implode('/', array_slice($path_parts, 2));
                require_once 'api/customers.php';
                break;
            case 'products':
                $_SERVER['PATH_INFO'] = '/' . implode('/', array_slice($path_parts, 2));
                require_once 'api/products.php';
                break;
            case 'invoices':
                $_SERVER['PATH_INFO'] = '/' . implode('/', array_slice($path_parts, 2));
                require_once 'api/invoices.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(['error' => 'API endpoint not found']);
                break;
        }
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>