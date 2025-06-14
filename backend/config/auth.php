<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/security.php';

/**
 * Authentication and Authorization Manager
 * Handles JWT tokens, user sessions, and API authentication
 */
class Auth {
    private static $jwtSecret;
    private static $jwtExpiry;
    
    public static function init() {
        Env::load();
        self::$jwtSecret = Env::get('JWT_SECRET', 'your-default-secret-change-this');
        self::$jwtExpiry = (int)Env::get('JWT_EXPIRY', 3600);
        
        if (self::$jwtSecret === 'your-default-secret-change-this' && Env::get('APP_ENV') === 'production') {
            throw new Exception('JWT_SECRET must be set in production environment');
        }
    }
    
    /**
     * Generate JWT token
     */
    public static function generateToken($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + self::$jwtExpiry;
        $payload['iat'] = time();
        $payload = json_encode($payload);
        
        $headerEncoded = self::base64UrlEncode($header);
        $payloadEncoded = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, self::$jwtSecret, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }
    
    /**
     * Verify JWT token
     */
    public static function verifyToken($token) {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }
            
            [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
            
            $signature = self::base64UrlDecode($signatureEncoded);
            $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, self::$jwtSecret, true);
            
            if (!hash_equals($signature, $expectedSignature)) {
                return false;
            }
            
            $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
            
            if ($payload['exp'] < time()) {
                return false; // Token expired
            }
            
            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get current user from token
     */
    public static function getCurrentUser() {
        $token = self::getTokenFromRequest();
        if (!$token) {
            return null;
        }
        
        $payload = self::verifyToken($token);
        return $payload ? $payload : null;
    }
    
    /**
     * Require authentication for API endpoint
     */
    public static function requireAuth() {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        return $user;
    }
    
    /**
     * Check if user has specific permission
     */
    public static function hasPermission($permission, $user = null) {
        if (!$user) {
            $user = self::getCurrentUser();
        }
        
        if (!$user) {
            return false;
        }
        
        return in_array($permission, $user['permissions'] ?? []) || 
               in_array('admin', $user['roles'] ?? []);
    }
    
    /**
     * Require specific permission
     */
    public static function requirePermission($permission) {
        $user = self::requireAuth();
        if (!self::hasPermission($permission, $user)) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }
        return $user;
    }
    
    /**
     * Generate API key for service authentication
     */
    public static function generateApiKey() {
        return 'sk_' . Security::generateRandomString(32);
    }
    
    /**
     * Hash API key for storage
     */
    public static function hashApiKey($apiKey) {
        return hash('sha256', $apiKey . self::$jwtSecret);
    }
    
    /**
     * Verify API key
     */
    public static function verifyApiKey($apiKey) {
        // This would typically check against a database of valid API keys
        // For now, we'll implement a simple version
        $hashedKey = self::hashApiKey($apiKey);
        
        // TODO: Check against database of valid API keys
        // For demo purposes, accept any properly formatted key
        return str_starts_with($apiKey, 'sk_') && strlen($apiKey) === 35;
    }
    
    /**
     * Rate limiting for failed authentication attempts
     */
    public static function checkAuthRateLimit($identifier) {
        $maxAttempts = 5;
        $timeWindow = 900; // 15 minutes
        
        $cacheFile = __DIR__ . '/../logs/auth_attempts.json';
        $attempts = [];
        
        if (file_exists($cacheFile)) {
            $attempts = json_decode(file_get_contents($cacheFile), true) ?: [];
        }
        
        $currentTime = time();
        $attempts[$identifier] = array_filter($attempts[$identifier] ?? [], function($timestamp) use ($currentTime, $timeWindow) {
            return ($currentTime - $timestamp) < $timeWindow;
        });
        
        if (count($attempts[$identifier]) >= $maxAttempts) {
            return false; // Rate limited
        }
        
        $attempts[$identifier][] = $currentTime;
        file_put_contents($cacheFile, json_encode($attempts));
        
        return true;
    }
    
    /**
     * Log authentication event
     */
    public static function logAuthEvent($event, $details = []) {
        Security::logSecurityEvent('auth_' . $event, $details);
    }
    
    /**
     * Get token from request headers
     */
    private static function getTokenFromRequest() {
        $headers = getallheaders();
        
        // Check Authorization header
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        // Check X-API-Key header for API key authentication
        if (isset($headers['X-API-Key'])) {
            $apiKey = $headers['X-API-Key'];
            if (self::verifyApiKey($apiKey)) {
                // Create a pseudo-token for API key authentication
                return self::generateToken([
                    'type' => 'api_key',
                    'key' => substr($apiKey, 0, 8) . '...',
                    'permissions' => ['read', 'write'] // Default permissions for API keys
                ]);
            }
        }
        
        return null;
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    /**
     * Create user session
     */
    public static function createUserSession($userId, $email, $roles = [], $permissions = []) {
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'roles' => $roles,
            'permissions' => $permissions,
            'type' => 'user_session'
        ];
        
        $token = self::generateToken($payload);
        
        self::logAuthEvent('login_success', [
            'user_id' => $userId,
            'email' => $email
        ]);
        
        return $token;
    }
    
    /**
     * Logout user (invalidate token on client side)
     */
    public static function logout() {
        $user = self::getCurrentUser();
        if ($user) {
            self::logAuthEvent('logout', [
                'user_id' => $user['user_id'] ?? null
            ]);
        }
        
        // In a real implementation, you might maintain a blacklist of invalidated tokens
        return true;
    }
}

// Initialize authentication system
Auth::init();
?>