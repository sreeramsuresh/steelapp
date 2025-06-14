<?php
require_once __DIR__ . '/env.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset;
    private $port;
    private $conn;
    
    public function __construct() {
        // Load environment configuration
        Env::load();
        
        // Validate required database variables
        Env::validateRequired(['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS']);
        
        $this->host = Env::get('DB_HOST');
        $this->db_name = Env::get('DB_NAME');
        $this->username = Env::get('DB_USER');
        $this->password = Env::get('DB_PASS');
        $this->charset = Env::get('DB_CHARSET', 'utf8mb4');
        $this->port = Env::get('DB_PORT', 3306);
    }

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }
        
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE {$this->charset}_unicode_ci"
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            // Log successful connection in development
            if (Env::get('APP_DEBUG', false)) {
                error_log("Database connection established successfully");
            }
            
        } catch(PDOException $exception) {
            // Log error securely without exposing sensitive information
            error_log("Database connection failed: " . $exception->getMessage());
            
            // Don't expose database details in production
            if (Env::get('APP_ENV') === 'development') {
                throw new Exception("Database connection failed: " . $exception->getMessage());
            } else {
                throw new Exception("Database connection failed. Please try again later.");
            }
        }
        
        return $this->conn;
    }
    
    public function closeConnection() {
        $this->conn = null;
    }
}

// Secure CORS configuration
function enableCors() {
    // Load environment configuration
    Env::load();
    
    // Get allowed origins from environment
    $allowedOrigins = Env::get('CORS_ORIGINS', ['http://localhost:3030']);
    $allowedMethods = Env::get('CORS_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
    $allowedHeaders = Env::get('CORS_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']);
    
    // Security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // HSTS in production
    if (Env::get('ENABLE_HSTS', false) && Env::get('APP_ENV') === 'production') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
    
    // Content Security Policy
    if (Env::get('ENABLE_CSP', false)) {
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    }
    
    // Handle CORS
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        $origin = $_SERVER['HTTP_ORIGIN'];
        
        // Check if origin is allowed
        if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
        } else {
            // Log unauthorized origin attempt
            error_log("Unauthorized CORS origin attempted: {$origin}");
        }
    }

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("Access-Control-Allow-Methods: " . implode(', ', $allowedMethods));
        header("Access-Control-Allow-Headers: " . implode(', ', $allowedHeaders));
        http_response_code(200);
        exit(0);
    }
}

// Common response functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendError($message, $status = 400) {
    sendResponse(['error' => $message], $status);
}

function sendSuccess($data = null, $message = 'Success') {
    $response = ['message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    sendResponse($response);
}
?>