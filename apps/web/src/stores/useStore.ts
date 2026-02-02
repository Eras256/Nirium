'use client';

import { create } from 'zustand';
import * as THREE from 'three';

interface NiriumState {
    // Cursor tracking
    cursorPosition: THREE.Vector3;
    setCursorPosition: (pos: THREE.Vector3) => void;

    // Navigation state
    activeSection: string;
    setActiveSection: (section: string) => void;

    // Theme & visual preferences
    glassIntensity: number;
    setGlassIntensity: (intensity: number) => void;

    // Wallet connection status
    isWalletConnected: boolean;
    walletAddress: string | null;
    setWalletConnection: (connected: boolean, address: string | null) => void;

    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // x402 payment state
    pendingPayment: {
        amount: number;
        destination: string;
        memo: string;
    } | null;
    setPendingPayment: (payment: { amount: number; destination: string; memo: string } | null) => void;

    // Neural network visualization settings
    neuralSettings: {
        particleCount: number;
        cursorStrength: number;
        synapseThreshold: number;
        bloomIntensity: number;
    };
    setNeuralSettings: (settings: Partial<NiriumState['neuralSettings']>) => void;
}

export const useStore = create<NiriumState>((set) => ({
    // Cursor tracking
    cursorPosition: new THREE.Vector3(0, 0, 0),
    setCursorPosition: (pos) => set({ cursorPosition: pos }),

    // Navigation state
    activeSection: 'dashboard',
    setActiveSection: (section) => set({ activeSection: section }),

    // Theme & visual preferences
    glassIntensity: 1.0,
    setGlassIntensity: (intensity) => set({ glassIntensity: intensity }),

    // Wallet connection status
    isWalletConnected: false,
    walletAddress: null,
    setWalletConnection: (connected, address) =>
        set({ isWalletConnected: connected, walletAddress: address }),

    // Loading states
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    // x402 payment state
    pendingPayment: null,
    setPendingPayment: (payment) => set({ pendingPayment: payment }),

    // Neural network visualization settings
    neuralSettings: {
        particleCount: 25000,
        cursorStrength: 15.0,
        synapseThreshold: 2.0,
        bloomIntensity: 1.5,
    },
    setNeuralSettings: (settings) =>
        set((state) => ({
            neuralSettings: { ...state.neuralSettings, ...settings },
        })),
}));

export default useStore;
