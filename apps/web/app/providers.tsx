"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { LanguageProvider } from '../context/LanguageContext';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </QueryClientProvider>
    );
}
