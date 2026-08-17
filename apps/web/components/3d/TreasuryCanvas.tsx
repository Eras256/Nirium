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
        <div className="w-full h-full relative !bg-transparent darkreader-ignore">
            <CanvasErrorBoundary>
                <Canvas
                    className="!bg-transparent darkreader-ignore"
                    camera={{ position: [0, 0, 35], fov: 42 }}
                    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0x000000, 0);
                        handleContextLoss({ gl });
                    }}
                    style={{ background: 'transparent' }}
                >
                    {/* @ts-ignore */}
                    <Suspense fallback={null}>
                        <TreasuryOrb />
                    </Suspense>
                </Canvas>
            </CanvasErrorBoundary>
        </div>
    );
}
