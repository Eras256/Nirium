/**
 * Freighter Wallet Authentication Utilities
 * Real signature verification for Stellar wallets
 */

import { Keypair, StrKey } from '@stellar/stellar-sdk';

/**
 * Sign a message with Freighter wallet
 * @param message - Message to sign (will be converted to Uint8Array)
 * @returns Base64 encoded signature
 */
export async function signMessageWithFreighter(message: string): Promise<string> {
    if (typeof window === 'undefined' || !window.freighter) {
        throw new Error('Freighter wallet not available');
    }

    try {
        const messageBytes = new TextEncoder().encode(message);
        const { signature } = await window.freighter.signMessage(messageBytes);
        return signature;
    } catch (error) {
        console.error('[Freighter] Signature failed:', error);
        throw new Error('User rejected signature request');
    }
}

/**
 * Verify a Stellar signature (backend)
 * @param walletAddress - Public key (G...)
 * @param message - Original message
 * @param signatureBase64 - Base64 encoded signature
 * @returns true if signature is valid
 */
export function verifySignature(
    walletAddress: string,
    message: string,
    signatureBase64: string
): boolean {
    try {
        // Validate wallet address format
        if (!StrKey.isValidEd25519PublicKey(walletAddress)) {
            console.error('[Auth] Invalid wallet address format');
            return false;
        }

        // Create keypair from public key
        const keypair = Keypair.fromPublicKey(walletAddress);

        // Convert message to bytes
        const messageBytes = new TextEncoder().encode(message);
        const messageBuffer = Buffer.from(messageBytes);

        // Decode signature from base64
        const signatureBuffer = Buffer.from(signatureBase64, 'base64');

        // Verify signature
        const isValid = keypair.verify(messageBuffer, signatureBuffer);

        if (!isValid) {
            console.warn('[SECURITY] Invalid signature for wallet:', walletAddress);
        }

        return isValid;
    } catch (error) {
        console.error('[Auth] Signature verification failed:', error);
        return false;
    }
}

/**
 * Generate authentication message with nonce
 * @param walletAddress - User's wallet address
 * @returns Message to sign
 */
export function generateAuthMessage(walletAddress: string): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(7);

    return `Nirium Agent API Authentication

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

By signing this message, you are authenticating with Nirium Protocol.`;
}

/**
 * Validate authentication message (check timestamp freshness)
 * @param message - Signed message
 * @param maxAgeMinutes - Maximum age in minutes (default 5)
 * @returns true if message is fresh
 */
export function validateAuthMessage(message: string, maxAgeMinutes: number = 5): boolean {
    try {
        const timestampMatch = message.match(/Timestamp: (\d+)/);
        if (!timestampMatch) return false;

        const timestamp = parseInt(timestampMatch[1], 10);
        const now = Date.now();
        const ageMinutes = (now - timestamp) / (1000 * 60);

        if (ageMinutes > maxAgeMinutes) {
            console.warn('[SECURITY] Authentication message expired');
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

// Type declarations for Freighter
declare global {
    interface Window {
        freighter?: {
            signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
            isConnected: () => Promise<boolean>;
            getPublicKey: () => Promise<string>;
        };
    }
}
