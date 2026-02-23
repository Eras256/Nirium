'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

export function NeuralOrb() {
    const orbRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef<THREE.Mesh>(null);

    // Create a series of particles for the "Neural" look
    const particlesCount = 200;
    const [positions, connections] = useMemo(() => {
        const pos = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / particlesCount);
            const theta = Math.sqrt(particlesCount * Math.PI) * phi;
            const r = 8 + Math.random() * 2;
            pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
            pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return [pos, null];
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (orbRef.current) {
            orbRef.current.rotation.y = time * 0.1;
            orbRef.current.rotation.z = time * 0.05;
        }
        if (pulseRef.current) {
            const s = 1 + Math.sin(time * 2) * 0.05;
            pulseRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group>
            {/* Core Orb */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere ref={orbRef} args={[8, 64, 64]}>
                    <MeshDistortMaterial
                        color="#2DEBE8"
                        speed={2}
                        distort={0.4}
                        radius={1}
                        emissive="#FFC800"
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>
            </Float>

            {/* Pulse Outer Layer */}
            <Sphere ref={pulseRef} args={[8.5, 32, 32]}>
                <meshBasicMaterial color="#2DEBE8" transparent opacity={0.05} side={THREE.BackSide} />
            </Sphere>

            {/* Neural Particles */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.1}
                    color="#2DEBE8"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Subtle Global Glow */}
            <pointLight position={[0, 0, 10]} intensity={1} color="#2DEBE8" />
            <pointLight position={[0, 0, -10]} intensity={0.5} color="#FFC800" />
        </group>
    );
}
