// @ts-nocheck
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useState } from 'react';

// Inline shaders to avoid dynamic import issues
const vertexShader = `
uniform float uTime;
uniform vec3 uCursorPosition;
uniform float uCursorStrength;
uniform float uParticleSize;

attribute float life;
attribute vec3 randomOffset;

varying vec3 vPosition;
varying float vLife;
varying float vDistanceToCursor;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec3 noiseOffset = vec3(
    snoise(position * 0.5 + randomOffset + uTime * 0.05),
    snoise(position * 0.5 + randomOffset + uTime * 0.05 + 100.0),
    snoise(position * 0.5 + randomOffset + uTime * 0.05 + 200.0)
  ) * 0.5;
  
  vec3 pos = position + noiseOffset;
  
  // Cursor attractor force: F = k / r²
  vec3 toCursor = uCursorPosition - pos;
  float distToCursor = length(toCursor);
  vDistanceToCursor = distToCursor;
  
  if (distToCursor > 0.1) {
    vec3 cursorForce = normalize(toCursor) * (uCursorStrength / (distToCursor * distToCursor));
    cursorForce = clamp(cursorForce, vec3(-1.5), vec3(1.5));
    pos += cursorForce * 0.1;
  }
  
  vPosition = pos;
  vLife = life;
  
  float dynamicSize = uParticleSize * (0.5 + life * 0.5);
  float cursorProximityBoost = smoothstep(4.0, 0.5, distToCursor) * 3.0;
  dynamicSize += cursorProximityBoost;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = dynamicSize * (250.0 / -mvPosition.z);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uEmissionColor;

varying vec3 vPosition;
varying float vLife;
varying float vDistanceToCursor;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  if (dist > 0.5) discard;
  
  float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
  float core = 1.0 - smoothstep(0.0, 0.2, dist);
  float pulse = sin(uTime * 2.0 + vLife * 10.0) * 0.3 + 0.7;
  float cursorGlow = smoothstep(4.0, 0.5, vDistanceToCursor);
  
  vec3 baseCol = uBaseColor * (0.5 + vLife * 0.5);
  vec3 emission = uEmissionColor * (core * 2.0 + cursorGlow * 2.0) * pulse;
  
  vec3 finalColor = baseCol + emission;
  
  if (cursorGlow > 0.3) {
    float sparkle = fract(sin(dot(vPosition.xy * uTime, vec2(12.9898, 78.233))) * 43758.5453);
    if (sparkle > 0.97) {
      finalColor += vec3(1.0, 1.0, 1.0) * 3.0;
    }
  }
  
  gl_FragColor = vec4(finalColor, alpha * (0.3 + vLife * 0.7));
}
`;

const PARTICLE_COUNT = 6000; // Drastically reduced for subtle, cleaner look

interface NeuralParticlesProps {
    cursorStrength?: number;
    particleSize?: number;
    baseColor?: THREE.Color;
    emissionColor?: THREE.Color;
}

export function NeuralParticles({
    cursorStrength = 8.0,
    particleSize = 1.2,
    baseColor = new THREE.Color(0x0b0c15), // Darker base
    emissionColor = new THREE.Color(0xD4AF37),
}: NeuralParticlesProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport, pointer } = useThree();
    const [cursorPosition, setCursorPosition] = useState(new THREE.Vector3(0, 0, 0));

    // Generate particle positions and attributes
    const [positions, lifes, randomOffsets] = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const lifes = new Float32Array(PARTICLE_COUNT);
        const randomOffsets = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Spherical distribution with varying radii
            const radius = 3 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            lifes[i] = Math.random();

            randomOffsets[i * 3] = Math.random() * 100;
            randomOffsets[i * 3 + 1] = Math.random() * 100;
            randomOffsets[i * 3 + 2] = Math.random() * 100;
        }

        return [positions, lifes, randomOffsets];
    }, []);

    // Update cursor position in 3D space
    useEffect(() => {
        const handleMouseMove = () => {
            const x = pointer.x * viewport.width * 0.5;
            const y = pointer.y * viewport.height * 0.5;
            setCursorPosition(new THREE.Vector3(x, y, 0));
        };

        handleMouseMove();
    }, [pointer.x, pointer.y, viewport, setCursorPosition]);

    // Animation loop
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uCursorPosition.value.copy(cursorPosition);
        }
    });

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uOpacity: { value: 0.15 }, // Very subtle for institutional grade
            uCursorPosition: { value: cursorPosition.clone() },
            uCursorStrength: { value: cursorStrength },
            uParticleSize: { value: particleSize },
            uBaseColor: { value: baseColor },
            uEmissionColor: { value: emissionColor },
        }),
        [cursorStrength, particleSize, baseColor, emissionColor, cursorPosition]
    );

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-life"
                    args={[lifes, 1]}
                />
                <bufferAttribute
                    attach="attributes-randomOffset"
                    args={[randomOffsets, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export default NeuralParticles;
