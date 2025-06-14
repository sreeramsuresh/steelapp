<?php
/**
 * Input Validation Class
 * Provides comprehensive validation for API inputs
 */
class Validator {
    private $errors = [];
    private $data = [];

    public function __construct($data = []) {
        $this->data = $data;
        $this->errors = [];
    }

    /**
     * Add validation error
     */
    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    /**
     * Check if validation passed
     */
    public function isValid() {
        return empty($this->errors);
    }

    /**
     * Get validation errors
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Get formatted error messages
     */
    public function getErrorMessages() {
        $messages = [];
        foreach ($this->errors as $field => $fieldErrors) {
            $messages[] = $field . ': ' . implode(', ', $fieldErrors);
        }
        return $messages;
    }

    /**
     * Validate required field
     */
    public function required($field, $message = null) {
        if (!isset($this->data[$field]) || trim($this->data[$field]) === '') {
            $this->addError($field, $message ?: "{$field} is required");
        }
        return $this;
    }

    /**
     * Validate email format
     */
    public function email($field, $message = null) {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, $message ?: "{$field} must be a valid email address");
        }
        return $this;
    }

    /**
     * Validate minimum length
     */
    public function minLength($field, $min, $message = null) {
        if (isset($this->data[$field]) && strlen(trim($this->data[$field])) < $min) {
            $this->addError($field, $message ?: "{$field} must be at least {$min} characters long");
        }
        return $this;
    }

    /**
     * Validate maximum length
     */
    public function maxLength($field, $max, $message = null) {
        if (isset($this->data[$field]) && strlen(trim($this->data[$field])) > $max) {
            $this->addError($field, $message ?: "{$field} must not exceed {$max} characters");
        }
        return $this;
    }

    /**
     * Validate numeric value
     */
    public function numeric($field, $message = null) {
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->addError($field, $message ?: "{$field} must be a number");
        }
        return $this;
    }

    /**
     * Validate positive number
     */
    public function positive($field, $message = null) {
        if (isset($this->data[$field]) && (float)$this->data[$field] < 0) {
            $this->addError($field, $message ?: "{$field} must be a positive number");
        }
        return $this;
    }

    /**
     * Validate integer
     */
    public function integer($field, $message = null) {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_INT)) {
            $this->addError($field, $message ?: "{$field} must be an integer");
        }
        return $this;
    }

    /**
     * Validate value is in allowed list
     */
    public function in($field, $allowed, $message = null) {
        if (isset($this->data[$field]) && !in_array($this->data[$field], $allowed)) {
            $allowedStr = implode(', ', $allowed);
            $this->addError($field, $message ?: "{$field} must be one of: {$allowedStr}");
        }
        return $this;
    }

    /**
     * Validate date format
     */
    public function date($field, $format = 'Y-m-d', $message = null) {
        if (isset($this->data[$field])) {
            $date = DateTime::createFromFormat($format, $this->data[$field]);
            if (!$date || $date->format($format) !== $this->data[$field]) {
                $this->addError($field, $message ?: "{$field} must be a valid date in format {$format}");
            }
        }
        return $this;
    }

    /**
     * Validate phone number (basic format)
     */
    public function phone($field, $message = null) {
        if (isset($this->data[$field])) {
            $phone = preg_replace('/[^0-9+\-\s\(\)]/', '', $this->data[$field]);
            if (strlen($phone) < 10) {
                $this->addError($field, $message ?: "{$field} must be a valid phone number");
            }
        }
        return $this;
    }

    /**
     * Validate GST number format (Indian)
     */
    public function gst($field, $message = null) {
        if (isset($this->data[$field]) && !empty($this->data[$field])) {
            $pattern = '/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/';
            if (!preg_match($pattern, $this->data[$field])) {
                $this->addError($field, $message ?: "{$field} must be a valid GST number");
            }
        }
        return $this;
    }

    /**
     * Custom validation with callback
     */
    public function custom($field, $callback, $message = null) {
        if (isset($this->data[$field])) {
            if (!$callback($this->data[$field])) {
                $this->addError($field, $message ?: "{$field} validation failed");
            }
        }
        return $this;
    }

    /**
     * Sanitize input data
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate and sanitize customer data
     */
    public static function validateCustomer($data) {
        $validator = new self($data);
        
        $validator
            ->required('name')
            ->maxLength('name', 255)
            ->email('email')
            ->phone('phone')
            ->maxLength('company', 255)
            ->numeric('creditLimit')
            ->positive('creditLimit')
            ->numeric('currentCredit')
            ->positive('currentCredit')
            ->in('status', ['active', 'inactive'])
            ->gst('gstNumber');

        return $validator;
    }

    /**
     * Validate and sanitize product data
     */
    public static function validateProduct($data) {
        $validator = new self($data);
        
        $allowedCategories = ['rebar', 'structural', 'sheet', 'pipe', 'angle', 'round', 'flat', 'wire'];
        $allowedUnits = ['kg', 'kg/m', 'kg/sheet', 'tonnes', 'pieces'];
        
        $validator
            ->required('name')
            ->maxLength('name', 255)
            ->required('category')
            ->in('category', $allowedCategories)
            ->maxLength('grade', 50)
            ->maxLength('size', 100)
            ->numeric('weight')
            ->positive('weight')
            ->in('unit', $allowedUnits)
            ->numeric('currentStock')
            ->positive('currentStock')
            ->numeric('minStock')
            ->positive('minStock')
            ->numeric('maxStock')
            ->positive('maxStock')
            ->numeric('costPrice')
            ->positive('costPrice')
            ->numeric('sellingPrice')
            ->positive('sellingPrice')
            ->maxLength('supplier', 255)
            ->maxLength('location', 255);

        return $validator;
    }

    /**
     * Validate and sanitize invoice data
     */
    public static function validateInvoice($data) {
        $validator = new self($data);
        
        $validator
            ->required('invoiceNumber')
            ->maxLength('invoiceNumber', 50)
            ->required('date')
            ->date('date')
            ->required('dueDate')
            ->date('dueDate')
            ->numeric('subtotal')
            ->positive('subtotal')
            ->numeric('gstAmount')
            ->positive('gstAmount')
            ->numeric('total')
            ->positive('total')
            ->in('status', ['draft', 'sent', 'paid', 'overdue']);

        // Validate customer data
        if (isset($data['customer'])) {
            $customerValidator = self::validateCustomer($data['customer']);
            if (!$customerValidator->isValid()) {
                $validator->errors['customer'] = $customerValidator->getErrors();
            }
        }

        // Validate items
        if (isset($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $index => $item) {
                $itemValidator = self::validateInvoiceItem($item);
                if (!$itemValidator->isValid()) {
                    $validator->errors["items.{$index}"] = $itemValidator->getErrors();
                }
            }
        }

        return $validator;
    }

    /**
     * Validate invoice item
     */
    public static function validateInvoiceItem($data) {
        $validator = new self($data);
        
        $validator
            ->required('name')
            ->maxLength('name', 255)
            ->maxLength('specification', 255)
            ->required('unit')
            ->maxLength('unit', 20)
            ->required('quantity')
            ->numeric('quantity')
            ->positive('quantity')
            ->required('rate')
            ->numeric('rate')
            ->positive('rate')
            ->required('amount')
            ->numeric('amount')
            ->positive('amount')
            ->maxLength('hsnCode', 20)
            ->numeric('gstRate')
            ->custom('gstRate', function($value) {
                return $value >= 0 && $value <= 100;
            }, 'GST rate must be between 0 and 100');

        return $validator;
    }
}
?>