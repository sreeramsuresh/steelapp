import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (import.meta.env.MODE === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In a real application, you would send this to a logging service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId
    };

    // Example: send to logging service
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });

    console.warn('Error logged:', errorData);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = import.meta.env.MODE === 'development';

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>
            
            <h1>Oops! Something went wrong</h1>
            
            <p className="error-message">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {errorId && (
              <p className="error-id">
                Error ID: <code>{errorId}</code>
              </p>
            )}

            <div className="error-actions">
              <button onClick={this.handleRetry} className="btn btn-primary">
                <RefreshCw size={18} />
                Try Again
              </button>
              
              <button onClick={this.handleReload} className="btn btn-secondary">
                <RefreshCw size={18} />
                Reload Page
              </button>
              
              <button onClick={this.handleGoHome} className="btn btn-secondary">
                <Home size={18} />
                Go Home
              </button>
            </div>

            {isDevelopment && error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-stack">
                  <h3>Error Message:</h3>
                  <pre>{error.message}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{error.stack}</pre>
                  
                  {errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-help">
              <h3>What can you do?</h3>
              <ul>
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background-color: #f9fafb;
            }

            .error-container {
              max-width: 600px;
              text-align: center;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .error-icon {
              color: #ef4444;
              margin-bottom: 24px;
            }

            .error-container h1 {
              color: #1f2937;
              margin-bottom: 16px;
              font-size: 2rem;
              font-weight: 600;
            }

            .error-message {
              color: #6b7280;
              font-size: 1.1rem;
              margin-bottom: 16px;
            }

            .error-id {
              color: #9ca3af;
              font-size: 0.9rem;
              margin-bottom: 32px;
            }

            .error-id code {
              background: #f3f4f6;
              padding: 4px 8px;
              border-radius: 4px;
              font-family: 'Monaco', 'Menlo', monospace;
            }

            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 32px;
            }

            .btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              text-decoration: none;
            }

            .btn-primary {
              background: #3b82f6;
              color: white;
            }

            .btn-primary:hover {
              background: #2563eb;
            }

            .btn-secondary {
              background: #e5e7eb;
              color: #374151;
            }

            .btn-secondary:hover {
              background: #d1d5db;
            }

            .error-details {
              text-align: left;
              margin: 32px 0;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              overflow: hidden;
            }

            .error-details summary {
              padding: 12px 16px;
              background: #f9fafb;
              cursor: pointer;
              font-weight: 500;
            }

            .error-stack {
              padding: 16px;
              max-height: 400px;
              overflow-y: auto;
            }

            .error-stack h3 {
              margin: 16px 0 8px 0;
              color: #374151;
              font-size: 1rem;
            }

            .error-stack pre {
              background: #f3f4f6;
              padding: 12px;
              border-radius: 4px;
              font-size: 0.85rem;
              overflow-x: auto;
              white-space: pre-wrap;
            }

            .error-help {
              border-top: 1px solid #e5e7eb;
              padding-top: 24px;
              text-align: left;
            }

            .error-help h3 {
              color: #374151;
              margin-bottom: 12px;
            }

            .error-help ul {
              color: #6b7280;
              margin: 0;
              padding-left: 20px;
            }

            .error-help li {
              margin-bottom: 4px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;