'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { NeuralField } from '@/components/visuals/NeuralField';
import * as THREE from 'three';

// Fix React 19 type compatibility for postprocessing effects
const NoiseImpl = Noise as any;
const VignetteImpl = Vignette as any;

interface NeuralCanvasProps {
    intensity?: number;
    color?: string;
}

export function NeuralCanvas({ intensity = 1.0, color }: NeuralCanvasProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full h-full fixed inset-0 -z-10 bg-[#02040A]">
            <Canvas
                camera={{ position: [0, 0, 30], fov: 45 }}
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    alpha: false,
                    stencil: false,
                    depth: false
                }}
                dpr={[1, 1.5]} // Optimize pixel ratio for performance
            >
                <Suspense fallback={null}>
                    <NeuralField intensity={intensity} color={color} />

                    <EffectComposer enableNormalPass={false}>
                        <Bloom
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                            height={300}
                            intensity={1.5}
                        />
                        <NoiseImpl opacity={0.05} />
                        <VignetteImpl eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
