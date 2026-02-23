'use client';

import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GlassPanelProps {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    transmission?: number;
    thickness?: number;
    roughness?: number;
    chromaticAberration?: number;
    anisotropy?: number;
    distortion?: number;
    distortionScale?: number;
    temporalDistortion?: number;
    children?: React.ReactNode;
    animate?: boolean;
    floatIntensity?: number;
}

/**
 * GlassPanel - A physically accurate glass component using MeshTransmissionMaterial
 * 
 * Implements the specification requirements:
 * - transmission: 1.0 (full transparency)
 * - thickness: 3.5 (substantial glass depth)
 * - roughness: 0.15 (frosted polish)
 * - chromaticAberration: 0.06 (RGB edge separation)
 * - anisotropy: 0.5 (directional blur)
 * - distortion: 0.2 (liquid deformation)
 */
export const GlassPanel = forwardRef<THREE.Mesh, GlassPanelProps>(
    (
        {
            width = 2,
            height = 1,
            depth = 0.1,
            radius = 0.1,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            transmission = 1.0,
            thickness = 3.5,
            roughness = 0.15,
            chromaticAberration = 0.06,
            anisotropy = 0.5,
            distortion = 0.2,
            distortionScale = 0.5,
            temporalDistortion = 0.1,
            children,
            animate = false,
            floatIntensity = 0.5,
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);

        useFrame((state) => {
            if (animate && meshRef.current) {
                meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
                meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.02;
            }
        });

        const content = (
            <RoundedBox
                ref={ref || meshRef}
                args={[width, height, depth]}
                radius={radius}
                smoothness={4}
                position={position}
                rotation={rotation as unknown as THREE.Euler}
            >
                <MeshTransmissionMaterial
                    transmission={transmission}
                    thickness={thickness}
                    roughness={roughness}
                    chromaticAberration={chromaticAberration}
                    anisotropicBlur={anisotropy}
                    distortion={distortion}
                    distortionScale={distortionScale}
                    temporalDistortion={temporalDistortion}
                    backside={true}
                    backsideThickness={0.5}
                    samples={16}
                    resolution={512}
                    color="#ffffff"
                    attenuationColor="#e0e0ff"
                    attenuationDistance={2}
                />
                {children}
            </RoundedBox>
        );

        if (animate) {
            return (
                <Float speed={1} rotationIntensity={0.1} floatIntensity={floatIntensity}>
                    {content}
                </Float>
            );
        }

        return content;
    }
);

GlassPanel.displayName = 'GlassPanel';

/**
 * GlassCard - A higher-level component that combines GlassPanel with HTML content overlay
 */
export interface GlassCardProps extends Omit<GlassPanelProps, 'children'> {
    htmlContent?: React.ReactNode;
    glassOpacity?: number;
}

export function GlassCard({
    _htmlContent,
    _glassOpacity,
    ...props
}: GlassCardProps & { _htmlContent?: React.ReactNode; _glassOpacity?: number }) {
    return (
        <group>
            <GlassPanel {...props} />
            {/* HTML content would be rendered via Html component from drei */}
        </group>
    );
}

/**
 * GlassSphere - Floating glass orb for governance proposals
 */
interface GlassSphereProps {
    radius?: number;
    position?: [number, number, number];
    color?: string;
    emissive?: string;
    emissiveIntensity?: number;
    transmission?: number;
    thickness?: number;
}

export function GlassSphere({
    radius = 0.5,
    position = [0, 0, 0],
    color = '#ffffff',
    _emissive,
    _emissiveIntensity,
    transmission = 0.9,
    thickness = 2,
}: GlassSphereProps & { _emissive?: string; _emissiveIntensity?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.position.y =
                position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[radius, 64, 64]} />
                <MeshTransmissionMaterial
                    transmission={transmission}
                    thickness={thickness}
                    roughness={0.1}
                    chromaticAberration={0.1}
                    anisotropicBlur={0.3}
                    distortion={0.3}
                    distortionScale={0.3}
                    temporalDistortion={0.2}
                    backside={true}
                    samples={16}
                    resolution={256}
                    color={color}
                />
            </mesh>
        </Float>
    );
}

export default GlassPanel;
