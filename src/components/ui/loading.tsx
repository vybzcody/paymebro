import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingState({
    message = 'Loading...',
    size = 'md',
    className
}: LoadingStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-6', className)}>
            <LoadingSpinner size={size} className="mb-4" />
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    );
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-gray-200',
                className
            )}
        />
    );
}

interface CardSkeletonProps {
    lines?: number;
    className?: string;
}

export function CardSkeleton({ lines = 3, className }: CardSkeletonProps) {
    return (
        <div className={cn('p-6 space-y-4', className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
        </div>
    );
}

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
    className
}: TableSkeletonProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center space-x-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            className={cn(
                                'h-4',
                                colIndex === 0 ? 'w-8' : 'flex-1'
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}