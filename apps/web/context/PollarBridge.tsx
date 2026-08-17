"use client";

// ───────────────────────────────────────────────────────────────
// PollarBridge — Pollar como segunda puerta de identidad, app-wide.
//
// Por qué un puente y no usar `usePollar()` directo en cada componente:
//   1. `usePollar()` LANZA si no hay <PollarProvider> arriba, y Pollar es
//      opcional (sin llave configurada la app debe seguir con Freighter).
//      Un hook no se puede llamar condicionalmente, así que el fallback vive
//      aquí: sin llave, el contexto queda en `available: false` y nadie truena.
//   2. Un solo PollarClient para toda la app → una sola sesión. Si cada página
//      montara su propio provider, el login de una no existiría en la otra.
//
// La red la manda NetworkContext: mainnet y testnet son apps SEPARADAS en
// Pollar (la red no se puede cambiar después de crear la app), cada una con su
// llave. El `key={network}` es obligatorio: PollarProvider fija su cliente en
// el primer render y no lo reconstruye al cambiar props — sin la key queda
// clavado en la red inicial y firmaría contra la app equivocada.
// ───────────────────────────────────────────────────────────────

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { PollarProvider, usePollar } from "@pollar/react";
// Sin esta hoja, el modal de login de Pollar se renderiza en el FLUJO del
// documento (aparece al final de la página, fuera de vista) en lugar de como
// capa flotante. El paquete la expone en el subpath ./styles.css.
import "@pollar/react/styles.css";
// Después de la de Pollar, para poder ganarle: z-index sobre nuestro chrome y
// espaciados apretados en pantallas de poca altura. Ver el archivo.
import "../app/pollar-modal.css";
import { useNetwork } from "./NetworkContext";

export type PollarSignedMessage = { signature: string; signerAddress: string };

export interface PollarBridgeValue {
    /** ¿Hay llave publishable para esta red? Si no, esta puerta no existe. */
    available: boolean;
    isAuthenticated: boolean;
    /** Dirección G de la wallet embebida, o null si aún no hay sesión. */
    address: string | null;
    /** Abre el modal de login de Pollar (correo + OAuth, ya branded). */
    openLogin: () => void;
    logout: () => void;
    /**
     * Firma un mensaje con SEP-53. Produce ed25519 sobre
     * sha256("Stellar Signed Message:\n" + msg) — el mismo digest que Freighter,
     * así que el agente lo verifica por la misma ruta sin cambios.
     */
    signMessage: (message: string) => Promise<PollarSignedMessage>;
    /**
     * El PollarClient crudo. Se expone SOLO para pagos x402: el adapter necesita
     * el cliente entero, no un método suelto — lee la dirección del authState y
     * llama `signAuthEntry(xdr, { validUntilLedger })`, que es dialecto de Pollar
     * y no de SEP-43. Traducir eso aquí sería duplicar el paquete que ya lo hace.
     * Devuelve null cuando Pollar no está configurado.
     */
    getClient: () => unknown | null;
}

const UNAVAILABLE: PollarBridgeValue = {
    available: false,
    isAuthenticated: false,
    address: null,
    openLogin: () => {},
    logout: () => {},
    signMessage: async () => {
        throw new Error("Pollar no está configurado en este entorno.");
    },
    getClient: () => null,
};

const PollarBridgeContext = createContext<PollarBridgeValue>(UNAVAILABLE);

export function usePollarBridge(): PollarBridgeValue {
    return useContext(PollarBridgeContext);
}

/** Vive DENTRO de PollarProvider: es el único que toca `usePollar()`. */
function BridgePublisher({ children }: { children: ReactNode }) {
    const { isAuthenticated, wallet, openLoginModal, logout, getClient } = usePollar();
    const address = wallet?.address ?? null;

    const value = useMemo<PollarBridgeValue>(
        () => ({
            available: true,
            isAuthenticated,
            address,
            openLogin: openLoginModal,
            logout,
            signMessage: async (message: string) => {
                const proof = await getClient().stellar.sep53.signMessage(message);
                if (proof.status !== "signed") {
                    throw new Error(proof.details || "Pollar no pudo firmar el mensaje.");
                }
                return { signature: proof.signature, signerAddress: proof.signerAddress };
            },
            getClient: () => getClient(),
        }),
        [isAuthenticated, address, openLoginModal, logout, getClient],
    );

    return <PollarBridgeContext.Provider value={value}>{children}</PollarBridgeContext.Provider>;
}

export function PollarBridgeProvider({ children }: { children: ReactNode }) {
    const { network } = useNetwork();
    const apiKey =
        network === "mainnet"
            ? process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY_MAINNET
            : process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY;

    // Sin llave: la app sigue igual con Freighter. Pollar es aditivo, no requisito.
    if (!apiKey) return <>{children}</>;

    return (
        <PollarProvider key={network} client={{ apiKey, stellarNetwork: network }}>
            <BridgePublisher>{children}</BridgePublisher>
        </PollarProvider>
    );
}
