'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Dodecahedron, Octahedron, MeshTransmissionMaterial, Environment } from '@react-three/drei';

import * as THREE from 'three';

const CORE_COLOR = '#B026FF';
const WIREFRAME_COLOR = '#00E5FF';

function Core() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
            // Pulsating effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <Icosahedron ref={meshRef} args={[1.5, 0]}>
            <MeshTransmissionMaterial
                backside
                samples={4}
                thickness={1.5}
                chromaticAberration={0.8}
                anisotropy={0.3}
                distortion={0.3}
                distortionScale={0.5}
                temporalDistortion={0.2}
                iridescence={1}
                iridescenceIOR={1}
                iridescenceThicknessRange={[0, 1400]}
                color={CORE_COLOR}
                emissive={CORE_COLOR}
                emissiveIntensity={0.6}
                clearcoat={1}
                toneMapped={false}
            />
        </Icosahedron>
    );
}

function TensorNetwork() {
    const innerRef = useRef<THREE.Group>(null);
    const outerRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (innerRef.current) {
            innerRef.current.rotation.x -= delta * 0.15;
            innerRef.current.rotation.y -= delta * 0.2;
            innerRef.current.rotation.z -= delta * 0.1;
        }
        if (outerRef.current) {
            outerRef.current.rotation.x += delta * 0.2;
            outerRef.current.rotation.y += delta * 0.1;
            outerRef.current.rotation.z -= delta * 0.15;
        }
    });

    return (
        <group>
            <group ref={innerRef}>
                <Dodecahedron args={[2.5, 0]}>
                    <meshBasicMaterial color={WIREFRAME_COLOR} wireframe transparent opacity={0.6} toneMapped={false} />
                </Dodecahedron>
                {/* Inner Glow layer for the wireframe edges */}
                <Dodecahedron args={[2.48, 0]}>
                    <meshBasicMaterial color={WIREFRAME_COLOR} wireframe transparent opacity={0.2} toneMapped={false} />
                </Dodecahedron>
            </group>

            <group ref={outerRef}>
                <Octahedron args={[3.3, 0]}>
                    <meshBasicMaterial color={CORE_COLOR} wireframe transparent opacity={0.7} toneMapped={false} />
                </Octahedron>
                {/* Outer Glow layer */}
                <Octahedron args={[3.28, 0]}>
                    <meshBasicMaterial color={CORE_COLOR} wireframe transparent opacity={0.3} toneMapped={false} />
                </Octahedron>
            </group>
        </group>
    );
}

function LightParticles() {
    const pointsRef = useRef<THREE.Points>(null);
    const particleCount = 250;

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);

            // Snap to the two geometric layers for path routing simulation
            const r = 2.5 + (Math.random() > 0.5 ? 0 : 0.8);

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            // Fast rotation to simulate rapid multi-hop path payments
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.8;
            pointsRef.current.rotation.z = state.clock.elapsedTime * 0.6;
            pointsRef.current.rotation.x = state.clock.elapsedTime * 0.4;

            // Pulse points for energy effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
            pointsRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                transparent
                color="#ffffff"
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </points>
    );
}

const TesseractScene = () => {
    return (
        <>
            {/* Background removed for transparency */}

            <ambientLight intensity={0.5} />
            {/* Dynamic neon lights */}
            <pointLight position={[10, 10, 10]} intensity={2.5} color={CORE_COLOR} distance={30} />
            <pointLight position={[-10, -10, -10]} intensity={2.5} color={WIREFRAME_COLOR} distance={30} />
            <pointLight position={[0, -5, 5]} intensity={1.5} color="#ffffff" distance={20} />

            <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
                <Core />
                <TensorNetwork />
                <LightParticles />
            </Float>

            <Environment preset="city" />

            {/* Stable ambient rendering without volatile PP effects */}
        </>
    );
};

export interface NiriumTesseractProps {
    className?: string;
}

export function NiriumTesseract({ className }: NiriumTesseractProps) {
    return (
        <div className={`w-full h-full min-h-[600px] relative rounded-2xl overflow-hidden shadow-2xl ${className || ''}`}>
            {/* Inner ambient glow background layer behind the Canvas */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/10 via-[#0A0515] to-[#B026FF]/10 z-0 pointer-events-none" />

            <Canvas
                camera={{ position: [0, 0, 8.5], fov: 45 }}
                className="z-10 bg-transparent"
                gl={{ antialias: true }}
            >
                <TesseractScene />
            </Canvas>
        </div>
    );
}

export default NiriumTesseract;
