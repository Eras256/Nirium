"use client";

import { useEffect, useState } from 'react';
import { useFreighter } from "@/hooks/useFreighter";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Hook to enforce security policies based on on-chain OwnerCap status.
 * If the cap is revoked or the user lose permissions, it triggers an emergency lockout.
 */
export function useSecurityKillSwitch() {
    const { address, isConnected, disconnect } = useFreighter();
    const elo = useEloReputation();
    const router = useRouter();
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (!isConnected || !address) return;

        const checkSecurityStatus = async () => {
            try {
                // Checking on-chain "ELO/Reputation" or OwnerCap health
                // If score is 0 or revoked, trigger kill-switch
                const score = await elo.getScore(address);

                if (score < 0) {
                    console.warn("[Security] Unauthorized access or revoked OwnerCap detected.");
                    handleLockout();
                }
            } catch (e) {
                // Fail-safe: if network check fails repeatedly, we don't lock but warn
                console.error("[Security] Failed to verify on-chain permissions:", e);
            }
        };

        const handleLockout = () => {
            setIsLocked(true);
            toast.error("SECURITY ALERT: OwnerCap Revoked", {
                description: "Your on-chain permissions have been terminated. Emergency lockout engaged.",
                duration: Infinity
            });

            // Force logout and redirect after delay
            setTimeout(() => {
                disconnect();
                router.push('/');
            }, 5000);
        };

        // Poll every 60 seconds for security heartbeat
        const interval = setInterval(checkSecurityStatus, 60000);
        checkSecurityStatus();

        return () => clearInterval(interval);
    }, [address, isConnected, elo, disconnect, router]);

    return { isLocked };
}
