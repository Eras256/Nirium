'use client';

import React, { useRef } from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';

/**
 * InstitutionalGlass
 * 
 * A premium, physics-based glass material component primarily for 3D UI containers.
 * Simulates heavy crystal with high refraction and chromatic aberration.
 * 
 * @param {THREE.Geometry} geometry - Optional geometry to use (default: PlaneGeometry)
 * @param {any} children - Content to render inside/behind (usually not used directly as children of material, but structure wise for meshes)
 * @param {object} props - Additional mesh props
 */
interface InstitutionalGlassProps {
    children?: React.ReactNode;
    geometry?: THREE.BufferGeometry;
    width?: number;
    height?: number;
    radius?: number; // corner radius if we were doing rounded rects, but standard mesh for now
    color?: string;
}

export function InstitutionalGlass({
    children,
    width = 1,
    height = 1,
    color = '#ffffff',
    ...props
}: InstitutionalGlassProps & React.ComponentProps<'mesh'>) {

    // We use a simple plane or box by default, but for "Cards" usually a rounded box geometry is preferred
    // For now, valid mesh wrapper.
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <mesh ref={meshRef} {...props}>
            {/* Default geometry if none provided via props, though usually passed or attached */}
            <planeGeometry args={[width, height]} />

            <MeshTransmissionMaterial
                backside={false}
                samples={16} // Quality
                resolution={512} // Resolution of transmission
                transmission={1.0} // Total clarity, glass-like
                thickness={3.5} // Heavy, expensive feel
                roughness={0.15} // Frosted matte finish
                chromaticAberration={0.06} // Premium dispersion effect
                anisotropy={0.5} // Directional blur
                distortion={0.2} // Liquid light bending
                distortionScale={0.5}
                temporalDistortion={0.1}
                clearcoat={1}
                attenuationDistance={0.5}
                attenuationColor={color}
                color={color}
                background={new THREE.Color('#02040A')} // Matches Void Blue aesthetic for transmission context
            />
            {children}
        </mesh>
    );
}
