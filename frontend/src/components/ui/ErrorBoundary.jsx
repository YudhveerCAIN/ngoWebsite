import { Component } from 'react'
import Button from './Button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
    
    // Report error to monitoring service
    this.reportError(error, errorInfo)
  }
  
  reportError = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous'
    }
    
    // Example: Send to error reporting service
    // errorReportingService.report(errorReport)
    
    console.error('Error Report:', errorReport)
  }
  
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }
  
  handleReload = () => {
    window.location.reload()
  }
  
  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }
      
      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              
              {/* Error Message */}
              <p className="text-gray-600 mb-6">
                {this.props.showDetails && this.state.error
                  ? this.state.error.message
                  : "We're sorry, but something unexpected happened. Please try again."
                }
              </p>
              
              {/* Error ID */}
              {this.state.errorId && (
                <p className="text-xs text-gray-400 mb-6">
                  Error ID: {this.state.errorId}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="w-full sm:w-auto">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="w-full sm:w-auto"
                >
                  Reload Page
                </Button>
              </div>
              
              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  If this problem persists, please contact support:
                </p>
                <a 
                  href="mailto:support@urjjapratishthan.org"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  support@urjjapratishthan.org
                </a>
              </div>
              
              {/* Development Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Development Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error boundary (for functional components)
export function useErrorHandler() {
  return (error, errorInfo) => {
    // This would typically integrate with your error reporting service
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // You could also throw the error to be caught by an ErrorBoundary
    // throw error
  }
}

export default ErrorBoundary