"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { NetworkProvider } from '../context/NetworkContext';
import { PollarBridgeProvider } from '../context/PollarBridge';

const queryClient = new QueryClient();

import NiriumTermsModal from "@/components/legal/NiriumTermsModal";
import { useFreighter } from "@/hooks/useFreighter";

function LegalWrapper({ children }: { children: ReactNode }) {
    const { address } = useFreighter();
    return (
        <>
            {children}
            <NiriumTermsModal walletAddress={address} />
        </>
    );
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <NetworkProvider>
                    {/* Dentro de NetworkProvider: elige la app de Pollar por red. */}
                    <PollarBridgeProvider>
                        <LegalWrapper>
                            {children}
                        </LegalWrapper>
                    </PollarBridgeProvider>
                </NetworkProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}
