'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Proposal {
    id: string;
    title: string;
    description: string;
    forVotes: number;
    againstVotes: number;
    quorum: number;
    endTime: Date;
    status: 'active' | 'passed' | 'rejected' | 'pending';
}

// Mock proposals data
const mockProposals: Proposal[] = [
    {
        id: '1',
        title: 'Upgrade to Protocol 26',
        description: 'Implement new ZK primitives',
        forVotes: 7500000,
        againstVotes: 2500000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active',
    },
    {
        id: '2',
        title: 'Treasury Allocation Q1',
        description: 'Allocate 5M XLM for development',
        forVotes: 8200000,
        againstVotes: 1800000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
    },
    {
        id: '3',
        title: 'New DEX Integration',
        description: 'Partner with Aquarius DEX',
        forVotes: 4500000,
        againstVotes: 3500000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
    },
    {
        id: '4',
        title: 'Community Grant Program',
        description: 'Fund ecosystem builders',
        forVotes: 9000000,
        againstVotes: 1000000,
        quorum: 10000000,
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'passed',
    },
];

interface ProposalOrbProps {
    proposal: Proposal;
    position: [number, number, number];
    index: number;
}

function ProposalOrb({ proposal, position, index }: ProposalOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    const totalVotes = proposal.forVotes + proposal.againstVotes;
    const approvalRatio = proposal.forVotes / totalVotes;
    const quorumRatio = totalVotes / proposal.quorum;

    // Size based on quorum participation (metaball-like)
    const radius = 0.3 + quorumRatio * 0.4;

    // Color gradient from purple (reject) to cyan (approve)
    const color = useMemo(() => {
        const r = Math.round((1 - approvalRatio) * 157);
        const g = Math.round(approvalRatio * 200 + (1 - approvalRatio) * 78);
        const b = Math.round(approvalRatio * 255 + (1 - approvalRatio) * 221);
        return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
    }, [approvalRatio]);

    useFrame((state) => {
        if (meshRef.current) {
            // Floating animation with unique phase per orb
            meshRef.current.position.y =
                position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index * 2) * 0.2;
            meshRef.current.rotation.y += 0.003;
        }

        if (glowRef.current) {
            // Pulsing glow
            const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <Float speed={0.5} floatIntensity={0.3}>
            <group position={position}>
                {/* Outer glow */}
                <mesh ref={glowRef} scale={1.3}>
                    <sphereGeometry args={[radius, 32, 32]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Glass orb */}
                <mesh ref={meshRef}>
                    <sphereGeometry args={[radius, 64, 64]} />
                    <MeshTransmissionMaterial
                        transmission={0.95}
                        thickness={1.5}
                        roughness={0.05}
                        chromaticAberration={0.08}
                        anisotropicBlur={0.4}
                        distortion={0.3}
                        distortionScale={0.4}
                        temporalDistortion={0.2}
                        backside={true}
                        samples={16}
                        resolution={256}
                        color={color}
                    />
                </mesh>

                {/* Inner glowing core */}
                <mesh>
                    <sphereGeometry args={[radius * 0.4, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* HTML tooltip on hover */}
                <Html
                    position={[0, radius + 0.5, 0]}
                    center
                    distanceFactor={10}
                    occlude
                >
                    <div className="
            px-3 py-2 rounded-lg
            bg-black/80 backdrop-blur-md
            border border-white/20
            text-center min-w-[150px]
            pointer-events-none
          ">
                        <p className="text-white text-sm font-medium">{proposal.title}</p>
                        <p className="text-xs text-cyan-400 mt-1">
                            {(approvalRatio * 100).toFixed(1)}% approval
                        </p>
                        <p className="text-xs text-white/50">
                            {(quorumRatio * 100).toFixed(0)}% quorum
                        </p>
                    </div>
                </Html>
            </group>
        </Float>
    );
}

function ProposalOrbsScene() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f3ff" />
            <pointLight position={[-5, -5, 5]} intensity={0.3} color="#9d4edd" />

            {mockProposals.map((proposal, index) => {
                // Arrange in a circle
                const angle = (index / mockProposals.length) * Math.PI * 2;
                const radius = 2.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <ProposalOrb
                        key={proposal.id}
                        proposal={proposal}
                        position={[x, 0, z]}
                        index={index}
                    />
                );
            })}
        </>
    );
}

interface ProposalOrbsProps {
    className?: string;
    height?: number;
}

export function ProposalOrbs({
    className = '',
    height = 400,
}: ProposalOrbsProps) {
    return (
        <div className={`relative w-full ${className}`} style={{ height }}>
            <Canvas
                camera={{ position: [0, 2, 6], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(15,10,30,0.8), rgba(5,3,15,1))',
                }}
            >
                <ProposalOrbsScene />
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <span className="text-white/60">High Approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                        <span className="text-white/60">Low Approval</span>
                    </div>
                </div>
                <span className="text-white/40">Orb size = Quorum participation</span>
            </div>
        </div>
    );
}

export default ProposalOrbs;
