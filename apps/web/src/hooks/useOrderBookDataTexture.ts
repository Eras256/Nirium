import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { StellarMarketService } from '@/services/StellarMarketService';

// Configuración de la simulación
const SIZE = 128; // Textura de 128x128 = 16,384 partículas (Optimizado para WebGL fluido)
const COUNT = SIZE * SIZE;

interface Order {
    price: number;
    volume: number;
}

export const useOrderBookDataTexture = (pair: string) => {
    // 1. Crear el buffer de datos inicial
    const data = useMemo(() => new Float32Array(COUNT * 4), []);

    // 2. Crear la textura de Three.js
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

    // Estado para el Spot Price (Precio central donde chocan los vórtices)
    const [spotPrice, setSpotPrice] = useState(0.12); // Valor inicial ej. XLM/USDC

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                // A. Actualizar Precio Spot (El centro del choque)
                const price = await StellarMarketService.getSpotPrice();
                if (isMounted) setSpotPrice(price);

                // B. Actualizar Muros de Liquidez (Los vórtices)
                const { bids, asks } = await StellarMarketService.getOrderBookDepth();

                // RELLENADO DE TEXTURA REAL
                for (let i = 0; i < COUNT; i++) {
                    const stride = i * 4;
                    const isAsk = i > COUNT / 2;
                    const sourceArray = isAsk ? asks : bids;

                    // Si hay menos órdenes que partículas, repetimos órdenes aleatoriamente
                    // para mantener la densidad visual del vórtice.
                    let order: Order;
                    if (sourceArray && sourceArray.length > 0) {
                        order = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                    } else {
                        // Fallback ficticio si no hay libro
                        const offset = isAsk ? 0.001 : -0.001;
                        order = { price: price + offset + (Math.random() * 0.005 * (isAsk ? 1 : -1)), volume: Math.random() * 0.1 };
                    }

                    // Mapeo a Canales RGBA
                    data[stride] = order.price;      // R: Posición Y (Price Target)
                    data[stride + 1] = order.volume; // G: Radio (Grosor del tornado / Volume)
                    data[stride + 2] = isAsk ? 1.0 : 0.0; // B: Color (0=Bid, 1=Ask)
                    data[stride + 3] = Math.random(); // A: Ruido individual
                }

                texture.needsUpdate = true;

            } catch (error) {
                console.error("Error fetching market data:", error);
            }
        };

        // Polling Loop: Cada 2 segundos
        const interval = setInterval(fetchData, 2000);

        // Llamada inicial inmediata
        fetchData();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [data, texture]);

    return { texture, spotPrice, size: SIZE };
};
