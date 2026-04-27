// @ts-nocheck
"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, FloatProps } from '@react-three/drei';
import * as THREE from 'three';

const Orb = ({ activity = 0.5 }: { activity?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Respond to activity: higher activity = faster spin and more distortion
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();

        meshRef.current.rotation.y = time * (0.2 + activity * 2);
        meshRef.current.rotation.z = time * (0.1 + activity);

        // Pulse scale based on activity
        const s = 1 + Math.sin(time * 2) * 0.05 * activity;
        meshRef.current.scale.set(s, s, s);
    });

    return (
        <Sphere args={[1, 64, 64]} ref={meshRef}>
            <MeshDistortMaterial
                color={activity > 0.8 ? "#00ffff" : "#7000ff"}
                speed={1 + activity * 4}
                distort={0.4 + activity * 0.4}
                radius={1}
                emissive={activity > 0.8 ? "#00ffff" : "#1a0033"}
                emissiveIntensity={0.5 + activity * 2}
                metalness={0.9}
                roughness={0.1}
            />
        </Sphere>
    );
};

import { useLanguage } from '@/context/LanguageContext';

const NeuralOrb = ({ activity = 0.5 }: { activity?: number }) => {
    const { t } = useLanguage();
    const [latency, setLatency] = React.useState<number>(20.5);

    React.useEffect(() => {
        setLatency(20 + Math.random() * 5);
        // Refresh latency subtly to feel alive
        const int = setInterval(() => setLatency(20 + Math.random() * 5), 2000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="w-full h-full min-h-[300px] relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-radial-gradient from-pulse-violet/20 to-transparent pointer-events-none blur-3xl" />

            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00aaff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#7000ff" />

                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <Orb activity={activity} />
                </Float>
            </Canvas>

            {/* Overlay Neural Text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <div className="text-[10px] font-mono tracking-[0.3em] text-stellar-blue/60 uppercase">{t.common.sync}</div>
                <div className="text-[8px] font-mono text-white/30 mt-1 uppercase">
                    {t.common.latency}: {latency.toFixed(1)}ms | {t.common.load}: {(activity * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default NeuralOrb;
