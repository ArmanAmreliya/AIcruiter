import React, { useState, useEffect } from 'react';
import { PipecatClient } from '@pipecat-ai/client-js';
import { PipecatClientProvider } from '@pipecat-ai/client-react';
import { DailyTransport } from '@pipecat-ai/daily-transport';
import { Loader2 } from 'lucide-react';

interface PipecatProviderProps {
    children: React.ReactNode;
}

export const PipecatProvider: React.FC<PipecatProviderProps> = ({ children }) => {
    const [client, setClient] = useState<any>(null);

    useEffect(() => {
        const pcClient = new PipecatClient({
            transport: new DailyTransport(),
            enableMic: true,
            enableCam: true,
        });
        setClient(pcClient);
    }, []);

    if (!client) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A0A0B] text-white">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={36} />
                <p className="text-sm font-medium tracking-wide opacity-75">Preparing voice service...</p>
            </div>
        );
    }

    return (
        <PipecatClientProvider client={client as any}>
            {children}
        </PipecatClientProvider>
    );
};
