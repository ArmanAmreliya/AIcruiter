import React from 'react';
import { motion } from 'framer-motion';
import { LoadingLogo } from './LoadingLogo';

export const PageLoader: React.FC = () => {
    return (
        <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-transparent">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center"
            >
                <LoadingLogo size={100} />
            </motion.div>

            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
    );
};

