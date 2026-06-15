
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Something went wrong
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    We encountered an unexpected error. Our team has been notified.
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-neutral-500">
                    {error.message}
                </div>
                <div className="pt-4 space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={resetErrorBoundary}
                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.replace('/')}>
            {children}
        </ReactErrorBoundary>
    );
};
