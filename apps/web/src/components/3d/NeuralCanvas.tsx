'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    Environment,
    Float,
} from '@react-three/drei';
import {
    EffectComposer,
    Bloom,
    ChromaticAberration,
    Vignette,
    Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { NeuralParticles } from './NeuralParticles';

function NeuralScene() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle rotation of the entire neural network
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <NeuralParticles
                cursorStrength={8.0}
                particleSize={1.2}
                baseColor={new THREE.Color(0x050508)}
                emissionColor={new THREE.Color(0xD4AF37)}
            />
        </group>
    );
}

function PostProcessingEffects() {
    return (
        <EffectComposer multisampling={0}>
            <Bloom
                intensity={0.3}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <ChromaticAberration
                offset={new THREE.Vector2(0.0005, 0.0005)}
                radialModulation={true}
                modulationOffset={0.5}
            />
            <Vignette
                offset={0.3}
                darkness={0.5}
                eskil={false}
                blendFunction={BlendFunction.NORMAL}
            />
            <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
    );
}

function LoadingFallback() {
    return (
        <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
                color="#D4AF37"
                emissive="#D4AF37"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}

interface NeuralCanvasProps {
    children?: React.ReactNode;
    className?: string;
}

export function NeuralCanvas({ children, className = '' }: NeuralCanvasProps) {
    return (
        <div className={`fixed inset-0 -z-10 ${className}`}>
            <Canvas
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                dpr={[1, 2]}
                style={{ background: 'linear-gradient(180deg, #050508 0%, #0A0B14 100%)' }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />

                {/* Ambient lighting */}
                <ambientLight intensity={0.1} />
                <pointLight position={[10, 10, 10]} intensity={0.3} color="#D4AF37" />
                <pointLight position={[-10, -10, -10]} intensity={0.2} color="#9d4edd" />

                <Suspense fallback={<LoadingFallback />}>
                    <Float
                        speed={0.5}
                        rotationIntensity={0.1}
                        floatIntensity={0.3}
                    >
                        <NeuralScene />
                    </Float>
                    <Environment preset="night" />
                </Suspense>

                <PostProcessingEffects />

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={true}
                    autoRotate={false}
                    maxPolarAngle={Math.PI * 0.75}
                    minPolarAngle={Math.PI * 0.25}
                />
            </Canvas>
            {children}
        </div>
    );
}

export default NeuralCanvas;
