<?php
require_once __DIR__ . '/env.php';

/**
 * Security Middleware
 * Handles rate limiting, request validation, and security checks
 */
class Security {
    private static $rateLimitFile = __DIR__ . '/../logs/rate_limit.json';

    /**
     * Initialize security checks
     */
    public static function init() {
        self::setupErrorReporting();
        self::checkRateLimit();
        self::validateRequest();
        self::preventXSS();
    }

    /**
     * Setup error reporting based on environment
     */
    private static function setupErrorReporting() {
        if (Env::get('APP_ENV') === 'production') {
            // Hide errors in production
            ini_set('display_errors', 0);
            ini_set('log_errors', 1);
            error_reporting(E_ALL);
        } else {
            // Show errors in development
            ini_set('display_errors', 1);
            error_reporting(E_ALL);
        }
    }

    /**
     * Rate limiting implementation
     */
    private static function checkRateLimit() {
        $maxRequests = (int)Env::get('RATE_LIMIT_REQUESTS', 100);
        $timeWindow = (int)Env::get('RATE_LIMIT_WINDOW', 3600); // 1 hour
        
        $clientIp = self::getClientIP();
        $currentTime = time();
        
        // Create logs directory if it doesn't exist
        $logsDir = dirname(self::$rateLimitFile);
        if (!is_dir($logsDir)) {
            mkdir($logsDir, 0755, true);
        }

        // Load rate limit data
        $rateLimitData = [];
        if (file_exists(self::$rateLimitFile)) {
            $rateLimitData = json_decode(file_get_contents(self::$rateLimitFile), true) ?: [];
        }

        // Clean old entries
        foreach ($rateLimitData as $ip => $data) {
            $rateLimitData[$ip] = array_filter($data, function($timestamp) use ($currentTime, $timeWindow) {
                return ($currentTime - $timestamp) < $timeWindow;
            });
            
            if (empty($rateLimitData[$ip])) {
                unset($rateLimitData[$ip]);
            }
        }

        // Check current IP
        if (!isset($rateLimitData[$clientIp])) {
            $rateLimitData[$clientIp] = [];
        }

        // Add current request
        $rateLimitData[$clientIp][] = $currentTime;

        // Check if limit exceeded
        if (count($rateLimitData[$clientIp]) > $maxRequests) {
            // Log rate limit violation
            error_log("Rate limit exceeded for IP: {$clientIp}");
            
            http_response_code(429);
            header('Content-Type: application/json');
            header('Retry-After: ' . $timeWindow);
            echo json_encode([
                'error' => 'Rate limit exceeded',
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $timeWindow
            ]);
            exit;
        }

        // Save updated rate limit data
        file_put_contents(self::$rateLimitFile, json_encode($rateLimitData));
    }

    /**
     * Get client IP address
     */
    private static function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    /**
     * Validate request basics
     */
    private static function validateRequest() {
        // Check request method
        $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods)) {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }

        // Check request size
        $maxSize = (int)Env::get('MAX_UPLOAD_SIZE', 10485760); // 10MB default
        if ($_SERVER['CONTENT_LENGTH'] > $maxSize) {
            http_response_code(413);
            echo json_encode(['error' => 'Request entity too large']);
            exit;
        }

        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/\b(union|select|insert|update|delete|drop|create|alter)\b/i',
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi',
            '/javascript:/i',
            '/on\w+\s*=/i'
        ];

        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        $queryString = $_SERVER['QUERY_STRING'] ?? '';
        
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $requestUri . $queryString)) {
                error_log("Suspicious request detected from IP: " . self::getClientIP() . " - " . $requestUri);
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request']);
                exit;
            }
        }
    }

    /**
     * Prevent XSS attacks
     */
    private static function preventXSS() {
        // Sanitize GET parameters
        foreach ($_GET as $key => $value) {
            $_GET[$key] = self::sanitizeInput($value);
        }

        // Sanitize POST data
        foreach ($_POST as $key => $value) {
            $_POST[$key] = self::sanitizeInput($value);
        }
    }

    /**
     * Sanitize input data
     */
    private static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        // Remove null bytes
        $data = str_replace("\0", '', $data);
        
        // Basic XSS protection
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        
        return $data;
    }

    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }

    /**
     * Verify CSRF token
     */
    public static function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent($event, $details = []) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => self::getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'event' => $event,
            'details' => $details,
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? ''
        ];
        
        $logFile = dirname(self::$rateLimitFile) . '/security.log';
        file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
        
        // Also log to error log
        error_log("Security Event: {$event} - IP: " . self::getClientIP());
    }

    /**
     * Generate secure random string
     */
    public static function generateRandomString($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }

    /**
     * Hash password securely
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536, // 64 MB
            'time_cost' => 4,       // 4 iterations
            'threads' => 3,         // 3 threads
        ]);
    }

    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>