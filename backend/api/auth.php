<?php
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../config/validator.php';
require_once '../config/auth.php';

// Initialize security checks
Security::init();

enableCors();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$path_parts = explode('/', trim($path_info, '/'));

switch ($method) {
    case 'POST':
        if (empty($path_parts[0]) || $path_parts[0] === 'login') {
            login($db);
        } elseif ($path_parts[0] === 'logout') {
            logout();
        } elseif ($path_parts[0] === 'register') {
            register($db);
        } elseif ($path_parts[0] === 'refresh') {
            refreshToken();
        }
        break;
        
    case 'GET':
        if ($path_parts[0] === 'me') {
            getCurrentUser();
        } elseif ($path_parts[0] === 'csrf-token') {
            getCSRFToken();
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function login($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            sendError('Email and password are required', 400);
            return;
        }
        
        $email = $input['email'];
        $password = $input['password'];
        
        // Validate input
        if (!Validator::validateEmail($email)) {
            sendError('Invalid email format', 400);
            return;
        }
        
        // Rate limiting for login attempts
        if (!Auth::checkAuthRateLimit($email)) {
            sendError('Too many login attempts. Please try again later.', 429);
            return;
        }
        
        // For demo purposes, create a simple admin user
        // In production, this would check against a users table
        if ($email === 'admin@steeltrading.com' && $password === 'admin123') {
            $token = Auth::createUserSession(1, $email, ['admin'], ['read', 'write', 'delete', 'admin']);
            
            sendSuccess([
                'token' => $token,
                'user' => [
                    'id' => 1,
                    'email' => $email,
                    'roles' => ['admin'],
                    'permissions' => ['read', 'write', 'delete', 'admin']
                ]
            ], 'Login successful');
        } else {
            Auth::logAuthEvent('login_failed', ['email' => $email]);
            sendError('Invalid credentials', 401);
        }
        
    } catch (Exception $e) {
        Auth::logAuthEvent('login_error', ['error' => $e->getMessage()]);
        sendError('Login failed: ' . $e->getMessage(), 500);
    }
}

function logout() {
    try {
        Auth::logout();
        sendSuccess(null, 'Logout successful');
    } catch (Exception $e) {
        sendError('Logout failed: ' . $e->getMessage(), 500);
    }
}

function register($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Basic validation
        if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
            sendError('Name, email and password are required', 400);
            return;
        }
        
        if (!Validator::validateEmail($input['email'])) {
            sendError('Invalid email format', 400);
            return;
        }
        
        if (strlen($input['password']) < 8) {
            sendError('Password must be at least 8 characters long', 400);
            return;
        }
        
        // For demo purposes, registration is disabled
        // In production, you would create the user in a users table
        sendError('Registration is currently disabled. Please contact administrator.', 403);
        
    } catch (Exception $e) {
        sendError('Registration failed: ' . $e->getMessage(), 500);
    }
}

function refreshToken() {
    try {
        $user = Auth::getCurrentUser();
        if (!$user) {
            sendError('Invalid token', 401);
            return;
        }
        
        // Generate new token with same payload
        $newToken = Auth::createUserSession(
            $user['user_id'], 
            $user['email'], 
            $user['roles'] ?? [], 
            $user['permissions'] ?? []
        );
        
        sendSuccess(['token' => $newToken], 'Token refreshed successfully');
        
    } catch (Exception $e) {
        sendError('Token refresh failed: ' . $e->getMessage(), 500);
    }
}

function getCurrentUser() {
    try {
        $user = Auth::getCurrentUser();
        if (!$user) {
            sendError('Not authenticated', 401);
            return;
        }
        
        sendSuccess([
            'user' => [
                'id' => $user['user_id'],
                'email' => $user['email'],
                'roles' => $user['roles'] ?? [],
                'permissions' => $user['permissions'] ?? []
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to get user info: ' . $e->getMessage(), 500);
    }
}

function getCSRFToken() {
    try {
        $token = Security::generateCSRFToken();
        sendSuccess(['csrf_token' => $token]);
    } catch (Exception $e) {
        sendError('Failed to generate CSRF token: ' . $e->getMessage(), 500);
    }
}
?>