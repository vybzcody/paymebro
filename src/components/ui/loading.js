import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function LoadingSpinner({ size = 'md', className }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };
    return (_jsx("div", { className: cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className) }));
}
export function LoadingState({ message = 'Loading...', size = 'md', className }) {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center p-6', className), children: [_jsx(LoadingSpinner, { size: size, className: "mb-4" }), _jsx("p", { className: "text-muted-foreground text-sm", children: message })] }));
}
export function Skeleton({ className }) {
    return (_jsx("div", { className: cn('animate-pulse rounded-md bg-gray-200', className) }));
}
export function CardSkeleton({ lines = 3, className }) {
    return (_jsxs("div", { className: cn('p-6 space-y-4', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-8 w-8 rounded-lg" })] }), _jsx(Skeleton, { className: "h-8 w-16" }), Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { className: "h-4 w-full" }, i)))] }));
}
export function TableSkeleton({ rows = 5, columns = 4, className }) {
    return (_jsx("div", { className: cn('space-y-4', className), children: Array.from({ length: rows }).map((_, rowIndex) => (_jsx("div", { className: "flex items-center space-x-4", children: Array.from({ length: columns }).map((_, colIndex) => (_jsx(Skeleton, { className: cn('h-4', colIndex === 0 ? 'w-8' : 'flex-1') }, colIndex))) }, rowIndex))) }));
}
