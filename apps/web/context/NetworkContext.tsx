'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import NetworkSwitchModal from '@/components/shared/NetworkSwitchModal';

type Network = 'testnet' | 'mainnet';

interface NetworkContextProps {
    network: Network;
    setNetwork: (net: Network) => void;
}

const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
    const [network, setNetwork] = useState<Network>('testnet');
    const [pendingMainnet, setPendingMainnet] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('nirium_network') as Network;
        if (saved && ['testnet', 'mainnet'].includes(saved)) {
            setNetwork(saved);
        }
    }, []);

    const apply = useCallback((net: Network) => {
        setNetwork(net);
        localStorage.setItem('nirium_network', net);
    }, []);

    // La confirmación vive aquí y no en el navbar para que cualquier punto que
    // cambie de red pase por la misma puerta. Solo se pregunta al ENTRAR a
    // mainnet: volver a testnet no arriesga nada, y confirmar lo inofensivo
    // entrena a la gente a aceptar sin leer.
    const handleSetNetwork = useCallback((net: Network) => {
        if (net === network) return;
        if (net === 'mainnet') {
            setPendingMainnet(true);
            return;
        }
        apply(net);
    }, [network, apply]);

    return (
        <NetworkContext.Provider value={{ network, setNetwork: handleSetNetwork }}>
            {children}
            <NetworkSwitchModal
                open={pendingMainnet}
                onCancel={() => setPendingMainnet(false)}
                onConfirm={() => {
                    setPendingMainnet(false);
                    apply('mainnet');
                }}
            />
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
}
