import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingLogoProps {
    className?: string;
    size?: number;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({
    className = '',
    size = 120
}) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <DotLottieReact
                src="https://lottie.host/29201f67-4e9f-498b-89eb-929dbed932e3/cohJgzeTU6.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};
