// @ts-nocheck
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreasuryOrb } from '@/app/components/TreasuryOrb';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

function handleContextLoss({ gl }: { gl: any }) {
    gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
        e.preventDefault(); // Allow the browser to restore the context
    }, false);
}

export function TreasuryCanvas() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="w-full h-full relative bg-transparent">
            <CanvasErrorBoundary>
                <Canvas
                    camera={{ position: [0, 0, 28], fov: 42 }}
                    gl={{ antialias: true, alpha: true }}
                    onCreated={handleContextLoss}
                    style={{ background: 'transparent' }}
                >
                    {/* @ts-ignore */}
                    <Suspense fallback={null}>
                        <TreasuryOrb />
                        <EffectComposer>
                            <Bloom
                                luminanceThreshold={0.08}
                                luminanceSmoothing={0.9}
                                height={300}
                                intensity={2.4}
                            />
                            <Vignette eskil={false} offset={0.15} darkness={1.0} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </CanvasErrorBoundary>
        </div>
    );
}
