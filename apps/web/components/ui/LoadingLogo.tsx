import React from 'react';

interface LoadingLogoProps {
    className?: string;
    size?: number;
    loading?: boolean;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({
    className = '',
    size = 120
}) => {
    return (
        <div className={`relative flex items-center justify-center mx-auto ${className}`} style={{ width: size, height: size }}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-spin"
                style={{
                    animationDuration: '0.8s',
                    filter: 'drop-shadow(0 0 8px rgba(121, 80, 242, 0.35))'
                }}
            >
                <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7950F2" stopOpacity="1" />
                        <stop offset="50%" stopColor="#7950F2" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7950F2" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Track circle (very faint purple) */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#7950F2"
                    strokeWidth="8"
                    className="opacity-10"
                />

                {/* Rotating gradient arc */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="180"
                    strokeDashoffset="40"
                />
            </svg>
        </div>
    );
};
