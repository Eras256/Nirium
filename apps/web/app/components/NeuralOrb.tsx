"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sphere, Environment, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

// Lightning Bolts Component
function LightningBolts() {
    const groupRef = useRef<THREE.Group>(null);
    // Create random initial positions for bolts
    const bolts = Array.from({ length: 6 }).map(() => ({
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: [0.02, Math.random() * 4 + 2, 0.02], // Thin and long
        color: Math.random() > 0.5 ? "#00f3ff" : "#bd00ff"
    }));

    useFrame((state) => {
        if (!groupRef.current) return;
        // Flash effect: Randomly visible
        groupRef.current.children.forEach((child, i) => {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshBasicMaterial;

            // Random flashing
            if (Math.random() > 0.90) {
                material.opacity = 0.8 + Math.random() * 0.2;
                mesh.scale.y = bolts[i].scale[1] * (0.8 + Math.random() * 0.5); // Jitter length
            } else {
                material.opacity = Math.max(0, material.opacity - 0.1); // Fade out
            }

            // Slow rotation of the whole system
            mesh.rotation.x += 0.01;
            mesh.rotation.z += 0.01;
        });
    });

    return (
        <group ref={groupRef}>
            {bolts.map((bolt, i) => (
                <mesh key={i} rotation={bolt.rotation as [number, number, number]}>
                    <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
                    <meshBasicMaterial
                        color={bolt.color}
                        transparent
                        opacity={0}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

function PulsingOrb() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const [hovered, setHovered] = React.useState(false);

    // We use a ref for speed to smooth it out without re-renders
    const targetSpeed = useRef(0.15);
    const currentSpeed = useRef(0.15);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;

            // Interactive Speed Logic
            targetSpeed.current = hovered ? 2.0 : 0.2; // Spin fast on hover
            // Smoothly interpolate current speed to target speed (Lerp)
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed.current, 0.05);

            // Apply rotation
            meshRef.current.rotation.y += currentSpeed.current * delta;

            // Complex breathing - intensified when hovered
            const breathingDetail = hovered ? 0.1 : 0.05;
            const scale = 1 + Math.sin(time * 0.8) * breathingDetail + Math.cos(time * 2) * 0.01;
            meshRef.current.scale.set(scale, scale, scale);
        }
        if (materialRef.current) {
            const time = state.clock.elapsedTime;
            // We can manipulate material props if needed
            // Shift color towards heavier purple/red when active
            const baseHue = hovered ? 0.75 : 0.6; // 0.6 is blueish, 0.75 pushes to purple
            materialRef.current.color.setHSL(baseHue + Math.sin(time * 0.2) * 0.05, 0.8, 0.6);

            // Increase distortion when spinning fast
            materialRef.current.distortion = hovered ? 0.8 : 0.4;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere
                args={[2.5, 128, 128]}
                ref={meshRef}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            >
                <MeshTransmissionMaterial
                    ref={materialRef}
                    backside
                    thickness={3}
                    roughness={0.02}
                    transmission={0.99}
                    ior={1.5}
                    chromaticAberration={0.1}
                    anisotropy={10}
                    distortionScale={0.4}
                    temporalDistortion={0.2}
                    color="#4e8aff"
                    toneMapped={false}
                />
            </Sphere>

            {/* Simulated Lightning Rays - Only visible/active when spinning fast or random? 
                Let's make them more chaotic when hovered 
            */}
            <LightningBolts />

            {/* Floating Ring for Depth */}
            <mesh rotation={[1.5, 0, 0]}>
                <torusGeometry args={[3.2, 0.05, 16, 100]} />
                <meshStandardMaterial color="#bd00ff" emissive="#bd00ff" emissiveIntensity={2} toneMapped={false} />
            </mesh>

            {/* Outer Neural Network (Cyan) */}
            <Sparkles
                count={120}
                scale={6}
                size={3}
                speed={hovered ? 2 : 0.4} // Particles speed up too
                opacity={0.6}
                color="#00f3ff"
            />
            {/* Inner Neural Activity (Purple) */}
            <Sparkles
                count={80}
                scale={3}
                size={5}
                speed={hovered ? 2.5 : 0.6}
                opacity={0.8}
                color="#bd00ff"
                noise={0.5}
            />
        </Float>
    );
}

export { PulsingOrb };

export default function NeuralOrb() {
    return (
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                <pointLight position={[-10, -5, 5]} intensity={1} color="#bd00ff" />
                <PulsingOrb />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
