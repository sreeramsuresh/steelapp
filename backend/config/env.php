<?php
/**
 * Environment Configuration Loader
 * Loads and validates environment variables from .env file
 */
class Env {
    private static $env = [];
    private static $loaded = false;

    /**
     * Load environment variables from .env file
     */
    public static function load($path = null) {
        if (self::$loaded) {
            return;
        }

        $envFile = $path ?: __DIR__ . '/../.env';
        
        if (!file_exists($envFile)) {
            // Try to load from example file in development
            $exampleFile = __DIR__ . '/../.env.example';
            if (file_exists($exampleFile) && self::get('APP_ENV', 'development') === 'development') {
                $envFile = $exampleFile;
            } else {
                throw new Exception('.env file not found. Please copy .env.example to .env and configure it.');
            }
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue; // Skip comments
            }

            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                
                self::$env[$key] = $value;
                
                // Also set in $_ENV for compatibility
                $_ENV[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Get environment variable with optional default
     */
    public static function get($key, $default = null) {
        self::load();
        
        // Check in order: self::$env, $_ENV, $_SERVER, getenv()
        if (isset(self::$env[$key])) {
            return self::parseValue(self::$env[$key]);
        }
        
        if (isset($_ENV[$key])) {
            return self::parseValue($_ENV[$key]);
        }
        
        if (isset($_SERVER[$key])) {
            return self::parseValue($_SERVER[$key]);
        }
        
        $value = getenv($key);
        if ($value !== false) {
            return self::parseValue($value);
        }
        
        return $default;
    }

    /**
     * Parse environment value to appropriate type
     */
    private static function parseValue($value) {
        if ($value === '') {
            return '';
        }

        // Boolean values
        if (in_array(strtolower($value), ['true', 'false'])) {
            return strtolower($value) === 'true';
        }

        // Numeric values
        if (is_numeric($value)) {
            return strpos($value, '.') !== false ? (float) $value : (int) $value;
        }

        // Array values (comma-separated)
        if (strpos($value, ',') !== false) {
            return array_map('trim', explode(',', $value));
        }

        return $value;
    }

    /**
     * Check if environment variable exists
     */
    public static function has($key) {
        return self::get($key) !== null;
    }

    /**
     * Get required environment variable (throws exception if not found)
     */
    public static function getRequired($key) {
        $value = self::get($key);
        
        if ($value === null) {
            throw new Exception("Required environment variable '{$key}' is not set");
        }
        
        return $value;
    }

    /**
     * Validate required environment variables
     */
    public static function validateRequired($requiredVars) {
        $missing = [];
        
        foreach ($requiredVars as $var) {
            if (!self::has($var)) {
                $missing[] = $var;
            }
        }
        
        if (!empty($missing)) {
            throw new Exception('Missing required environment variables: ' . implode(', ', $missing));
        }
    }
}
?>