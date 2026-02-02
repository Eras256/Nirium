'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/stores/useStore';

const SYNAPSE_THRESHOLD = 0.1; // ε - distance threshold for synaptic connection
const MAX_SYNAPSES = 5000;

const synapseVertexShader = `
uniform float uTime;

attribute vec3 startPos;
attribute vec3 endPos;
attribute float strength;

varying float vStrength;
varying float vProgress;

void main() {
  // uv.x = 0 for start, 1 for end
  float t = uv.x;
  vProgress = t;
  vStrength = strength;
  
  vec3 pos = mix(startPos, endPos, t);
  
  // Wave animation along synapse
  float wave = sin(uTime * 4.0 + t * 6.28318) * 0.03 * strength;
  pos.y += wave;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const synapseFragmentShader = `
uniform float uTime;
uniform vec3 uSynapseColor;

varying float vStrength;
varying float vProgress;

void main() {
  vec3 color = uSynapseColor;
  
  // Traveling pulse
  float pulse = fract(uTime * 1.5 - vProgress);
  float pulseBrightness = smoothstep(0.0, 0.15, pulse) * smoothstep(0.4, 0.15, pulse);
  
  // Fade at endpoints
  float endFade = smoothstep(0.0, 0.15, vProgress) * smoothstep(1.0, 0.85, vProgress);
  
  // Electric flicker
  float flicker = 0.85 + 0.15 * sin(uTime * 25.0 + vProgress * 40.0);
  
  // Opacity = 1.0 - d/ε (from specification)
  float alpha = vStrength * endFade * flicker;
  
  // Pulse glow
  color += vec3(0.3, 0.7, 1.0) * pulseBrightness * 2.5;
  
  gl_FragColor = vec4(color, alpha * 0.5);
}
`;

interface SynapseConnectionsProps {
    particlePositions: Float32Array;
    threshold?: number;
    color?: THREE.Color;
}

export function SynapseConnections({
    particlePositions,
    threshold = 2.0,
    color = new THREE.Color(0x00f3ff),
}: SynapseConnectionsProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const cursorPosition = useStore((state) => state.cursorPosition);

    // Build synapse geometry connecting nearby particles
    const geometry = useMemo(() => {
        const positions: number[] = [];
        const startPositions: number[] = [];
        const endPositions: number[] = [];
        const strengths: number[] = [];
        const uvs: number[] = [];

        const particleCount = particlePositions.length / 3;
        let synapseCount = 0;

        // Sample particles to find nearby connections
        for (let i = 0; i < particleCount && synapseCount < MAX_SYNAPSES; i += 3) {
            const ax = particlePositions[i * 3];
            const ay = particlePositions[i * 3 + 1];
            const az = particlePositions[i * 3 + 2];

            for (let j = i + 1; j < particleCount && synapseCount < MAX_SYNAPSES; j += 5) {
                const bx = particlePositions[j * 3];
                const by = particlePositions[j * 3 + 1];
                const bz = particlePositions[j * 3 + 2];

                const dx = bx - ax;
                const dy = by - ay;
                const dz = bz - az;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < threshold && dist > 0.1) {
                    // Opacity = 1.0 - d/ε
                    const strength = 1.0 - dist / threshold;

                    // Start vertex
                    positions.push(ax, ay, az, bx, by, bz);
                    startPositions.push(ax, ay, az, ax, ay, az);
                    endPositions.push(bx, by, bz, bx, by, bz);
                    strengths.push(strength, strength);
                    uvs.push(0, 0, 1, 0);

                    synapseCount++;
                }
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('startPos', new THREE.Float32BufferAttribute(startPositions, 3));
        geo.setAttribute('endPos', new THREE.Float32BufferAttribute(endPositions, 3));
        geo.setAttribute('strength', new THREE.Float32BufferAttribute(strengths, 1));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        return geo;
    }, [particlePositions, threshold]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSynapseColor: { value: color },
        }),
        [color]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <lineSegments ref={meshRef} geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={synapseVertexShader}
                fragmentShader={synapseFragmentShader}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </lineSegments>
    );
}

export default SynapseConnections;
