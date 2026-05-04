// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Sphere, MeshDistortMaterial, Torus } from '@react-three/drei';

/** Orbital node — a small sphere that travels along a ring */
function OrbitalNode({ radius, speed, offset, color, tiltX = 0, tiltZ = 0 }: {
    radius: number; speed: number; offset: number; color: string; tiltX?: number; tiltZ?: number;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime() * speed + offset;
        // position along tilted orbit
        const x = Math.cos(t) * radius;
        const y = Math.sin(t) * radius * Math.cos(tiltX);
        const z = Math.sin(t) * radius * Math.sin(tiltX) + Math.cos(t) * radius * Math.sin(tiltZ);
        ref.current.position.set(x, y, z);
    });
    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} roughness={0} metalness={1} />
        </mesh>
    );
}

export function TreasuryOrb() {
    const vaultRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef<THREE.Mesh>(null);

    // 300 particles distributed on sphere surface
    const positions = useMemo(() => {
        const count = 300;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const r = 8.8 + Math.random() * 1.4;
            pos[i * 3]     = r * Math.cos(theta) * Math.sin(phi);
            pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (vaultRef.current) {
            vaultRef.current.rotation.y = t * 0.08;
            vaultRef.current.rotation.z = t * 0.03;
        }
        if (pulseRef.current) {
            const s = 1 + Math.sin(t * 1.6) * 0.04;
            pulseRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group>
            {/* ── Core vault orb ── */}
            <Float speed={1.6} rotationIntensity={0.6} floatIntensity={0.8}>
                <Sphere ref={vaultRef} args={[7, 64, 64]}>
                    <MeshDistortMaterial
                        color="#2DEBE8"
                        speed={1.4}
                        distort={0.28}
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

            {/* ── Soft outer pulse ── */}
            <Sphere ref={pulseRef} args={[7.6, 32, 32]}>
                <meshBasicMaterial color="#FFC800" transparent opacity={0.04} side={THREE.BackSide} />
            </Sphere>

            {/* ── Orbit ring 1 — USDC (flat, teal) ── */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <Torus args={[10.5, 0.06, 6, 80]}>
                    <meshBasicMaterial color="#2DEBE8" transparent opacity={0.18} />
                </Torus>
            </group>
            <OrbitalNode radius={10.5} speed={0.45} offset={0}           color="#2DEBE8" tiltX={Math.PI / 2} />
            <OrbitalNode radius={10.5} speed={0.45} offset={Math.PI}     color="#2DEBE8" tiltX={Math.PI / 2} />

            {/* ── Orbit ring 2 — CETES (tilted 42°, yellow) ── */}
            <group rotation={[Math.PI / 2 - 0.73, 0.4, 0.2]}>
                <Torus args={[12, 0.055, 6, 80]}>
                    <meshBasicMaterial color="#FFC800" transparent opacity={0.14} />
                </Torus>
            </group>
            <OrbitalNode radius={12} speed={0.28} offset={1.1}   color="#FFC800" tiltX={Math.PI / 2 - 0.73} tiltZ={0.2} />


            {/* ── Transaction particles ── */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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

            {/* ── Lights — yellow front, teal back, matching original ── */}
            <pointLight position={[0,  0,  10]} intensity={1}   color="#2DEBE8" />
            <pointLight position={[0,  0, -10]} intensity={0.5} color="#FFC800" />
        </group>
    );
}
