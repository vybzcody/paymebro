import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: undefined });
            }
        });
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "min-h-[200px] flex items-center justify-center p-6", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Something went wrong. Please try refreshing the page or contact support if the problem persists." })] }), _jsxs(Button, { onClick: this.handleRetry, variant: "outline", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Try Again"] }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("details", { className: "mt-4 text-left", children: [_jsx("summary", { className: "cursor-pointer text-sm text-muted-foreground", children: "Error Details (Development)" }), _jsx("pre", { className: "mt-2 text-xs bg-muted p-2 rounded overflow-auto", children: this.state.error.stack })] }))] }) }));
        }
        return this.props.children;
    }
}
// Hook version for functional components
export function useErrorBoundary() {
    const [error, setError] = React.useState(null);
    const resetError = React.useCallback(() => {
        setError(null);
    }, []);
    const captureError = React.useCallback((error) => {
        setError(error);
    }, []);
    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    return { captureError, resetError };
}
