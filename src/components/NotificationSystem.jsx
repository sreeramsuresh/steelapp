import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

let notificationId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = ++notificationId;
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}

      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .notification-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const { type, message, title, action } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  return (
    <div className={`notification ${getTypeClass()}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        
        <div className="notification-body">
          {title && <div className="notification-title">{title}</div>}
          <div className="notification-message">{message}</div>
          {action && (
            <div className="notification-action">
              {action}
            </div>
          )}
        </div>
        
        <button 
          className="notification-close"
          onClick={onRemove}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        .notification {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
          max-width: 100%;
        }

        .notification-success {
          border-left-color: #10b981;
        }

        .notification-error {
          border-left-color: #ef4444;
        }

        .notification-warning {
          border-left-color: #f59e0b;
        }

        .notification-info {
          border-left-color: #3b82f6;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          gap: 12px;
        }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-success .notification-icon {
          color: #10b981;
        }

        .notification-error .notification-icon {
          color: #ef4444;
        }

        .notification-warning .notification-icon {
          color: #f59e0b;
        }

        .notification-info .notification-icon {
          color: #3b82f6;
        }

        .notification-body {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .notification-message {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .notification-action {
          margin-top: 8px;
        }

        .notification-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .notification-close:hover {
          background: #f3f4f6;
          color: #6b7280;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// HOC for API error handling
export const withNotificationHandling = (WrappedComponent) => {
  return function WithNotificationHandlingComponent(props) {
    const { error: notifyError, success: notifySuccess } = useNotification();

    const handleApiError = useCallback((error) => {
      let message = 'An unexpected error occurred';
      
      if (error.code === 'NETWORK_ERROR') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'TIMEOUT') {
        message = 'Request timed out. Please try again.';
      } else if (error.status === 429) {
        message = 'Too many requests. Please wait and try again.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }

      notifyError(message);
    }, [notifyError]);

    const handleApiSuccess = useCallback((message) => {
      notifySuccess(message);
    }, [notifySuccess]);

    return (
      <WrappedComponent
        {...props}
        onApiError={handleApiError}
        onApiSuccess={handleApiSuccess}
      />
    );
  };
};

export default NotificationProvider;