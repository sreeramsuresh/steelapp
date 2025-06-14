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
    $content = file_get_contents($indexPath);
    // Check if this is the built version (contains bundled assets)
    if (strpos($content, '/src/main.jsx') !== false) {
        // This is the development index.html, serve fallback
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steel Trading App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .loading { text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="loading">
            <h1>Steel Trading App</h1>
            <p>Building your application... Please wait.</p>
            <p>If this message persists, the build is still in progress.</p>
        </div>
    </div>
</body>
</html>';
    } else {
        // This is the built version
        echo $content;
    }
} else {
    // Fallback HTML if build doesn't exist
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steel Trading App</title>
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