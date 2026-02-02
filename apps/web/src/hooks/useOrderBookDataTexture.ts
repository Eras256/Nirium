import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { StellarMarketService } from '@/services/StellarMarketService';

// Simulation Configuration
const SIZE = 128; // 128x128 texture = 16,384 particles (Optimized for smooth WebGL)
const COUNT = SIZE * SIZE;

interface Order {
    price: number;
    volume: number;
}

export const useOrderBookDataTexture = (pair: string) => {
    // 1. Create the initial data buffer
    const data = useMemo(() => new Float32Array(COUNT * 4), []);

    // 2. Create the Three.js texture
    const texture = useMemo(() => {
        const tex = new THREE.DataTexture(
            data,
            SIZE,
            SIZE,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        tex.needsUpdate = true;
        return tex;
    }, [data]);

    // State for the Spot Price (Central collision point of the vortices)
    const [spotPrice, setSpotPrice] = useState(0.12); // Initial value e.g. XLM/USDC

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                // A. Update Spot Price (The collision center)
                const price = await StellarMarketService.getSpotPrice();
                if (isMounted) setSpotPrice(price);

                // B. Update Liquidity Walls (The vortices)
                const { bids, asks } = await StellarMarketService.getOrderBookDepth();

                // REAL TEXTURE FILLING
                for (let i = 0; i < COUNT; i++) {
                    const stride = i * 4;
                    const isAsk = i > COUNT / 2;
                    const sourceArray = isAsk ? asks : bids;

                    // If there are fewer orders than particles, repeat orders randomly
                    // to maintain the visual density of the vortex.
                    let order: Order;
                    if (sourceArray && sourceArray.length > 0) {
                        order = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                    } else {
                        // Fictitious fallback if no order book is available
                        const offset = isAsk ? 0.001 : -0.001;
                        order = { price: price + offset + (Math.random() * 0.005 * (isAsk ? 1 : -1)), volume: Math.random() * 0.1 };
                    }

                    // Mapping to RGBA Channels
                    data[stride] = order.price;      // R: Y Position (Price Target)
                    data[stride + 1] = order.volume; // G: Radius (Tornado thickness / Volume)
                    data[stride + 2] = isAsk ? 1.0 : 0.0; // B: Color (0=Bid, 1=Ask)
                    data[stride + 3] = Math.random(); // A: Individual noise
                }

                texture.needsUpdate = true;

            } catch (error) {
                console.error("Error fetching market data:", error);
            }
        };

        // Polling Loop: Every 2 seconds
        const interval = setInterval(fetchData, 2000);

        // Immediate initial call
        fetchData();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [data, texture]);

    return { texture, spotPrice, size: SIZE };
};
