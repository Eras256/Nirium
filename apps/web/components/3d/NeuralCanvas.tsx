// @ts-nocheck
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { NeuralOrb } from '@/app/components/NeuralOrb';

export function NeuralCanvas() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 25], fov: 45 }}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
            >
                {/* @ts-ignore - React 19 type mismatch in Next.js */}
                <Suspense fallback={null}>
                    <NeuralOrb />
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.1}
                            luminanceSmoothing={0.9}
                            height={300}
                            intensity={0.8}
                        />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
