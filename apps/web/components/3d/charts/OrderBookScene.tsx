// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
// Mock useOrderBookDataTexture since the original was deleted
const useOrderBookDataTexture = (symbol: string) => {
    return {
        texture: new THREE.DataTexture(new Float32Array(32 * 32 * 4), 32, 32, THREE.RGBAFormat, THREE.FloatType),
        spotPrice: 0.12,
        size: 32
    };
};

// --- SHADERS ---

const SIMULATION_SHADER = `
uniform float uTime;
uniform sampler2D uOrderBookData; // x=Price, y=Vol, z=Type, w=Unused
uniform float uSpotPrice;

// Simplex Noise 3D (Ashima Arts)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    float n1 = snoise(vec3(p.x, p.y + e, p.z));
    float n2 = snoise(vec3(p.x, p.y - e, p.z));
    float n3 = snoise(vec3(p.x, p.y, p.z + e));
    float n4 = snoise(vec3(p.x, p.y, p.z - e));
    float n5 = snoise(vec3(p.x + e, p.y, p.z));
    float n6 = snoise(vec3(p.x - e, p.y, p.z));
    float x = n2 - n1 - n4 + n3;
    float y = n4 - n3 - n6 + n5;
    float z = n6 - n5 - n2 + n1;
    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(uCurrentPosition, uv);
    vec4 data = texture2D(uOrderBookData, uv); 

    float priceLevel = data.x;
    float volume = data.y;
    // float isAsk = data.z;

    // Target Calculation
    // Scale price diff heavily to separate levels visibly in Y axis
    float yTarget = (priceLevel - uSpotPrice) * 50.0; 
    
    // Vortex Physics
    float angle = uTime * 0.5 + (pos.y * 0.2); // Rotation speed decreases with height
    float radiusBase = 2.0;
    float radius = radiusBase + (volume * 1.5); // Volume expands outward
    
    vec3 targetPos = vec3(
        sin(angle) * radius,
        yTarget,
        cos(angle) * radius
    );

    // Forces
    vec3 attraction = (targetPos - pos.xyz) * 0.08; // Strong pull to orbit
    vec3 noise = curlNoise(pos.xyz * 0.8 + uTime * 0.2) * 0.15; // Turbulence
    
    // Integration
    vec3 velocity = attraction + noise;
    
    // Reset Logic
    // If too far or NaN, respawn near center but at correct height
    // Also randomly reset some particles to create flow visual
    if (length(pos.xyz) > 30.0 || isnan(pos.x)) {
        pos.xyz = targetPos * 0.5; 
    } else {
        pos.xyz += velocity;
    }

    gl_FragColor = vec4(pos.xyz, 1.0);
}
`;

const RENDER_VERTEX = `
uniform sampler2D uPositionTexture;
uniform sampler2D uOrderBookData;
varying float vIsAsk;
varying float vIntensity;
varying float vVolume;

void main() {
    vec4 pos = texture2D(uPositionTexture, position.xy);
    vec4 data = texture2D(uOrderBookData, position.xy);
    
    vIsAsk = data.z; // Blue channel = Bid/Ask type (0.0 or 1.0)
    vVolume = data.y;

    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size based on volume and perspective
    // Larger volume = larger particles
    gl_PointSize = (4.0 + vVolume * 6.0) * (50.0 / -mvPosition.z);
    
    // Intensity based on proximity to center (Spot Price collision)
    // Assuming Spot Price is relative Y=0
    float distToCenter = abs(pos.y);
    vIntensity = 1.0 - smoothstep(0.0, 5.0, distToCenter);
}
`;

const RENDER_FRAGMENT = `
varying float vIsAsk;
varying float vIntensity;
varying float vVolume;

void main() {
    // Circle shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Colors
    // 0.0 = Bid = Cyan
    // 1.0 = Ask = Red/Magenta
    vec3 colorBid = vec3(0.0, 0.9, 1.0); // Cyan
    vec3 colorAsk = vec3(1.0, 0.0, 0.4); // Magenta
    
    vec3 baseColor = mix(colorBid, colorAsk, vIsAsk);
    
    // Core Brightness
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    
    // Add bloom/white hot at center of vortex (collision)
    vec3 finalColor = baseColor + vec3(1.0) * vIntensity * 0.8;
    
    // Alpha fade at edges
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * 0.8;

    gl_FragColor = vec4(finalColor, alpha);
}
`;

export function OrderBookScene({ symbol = 'XLM/USDC' }: { symbol?: string }) {
    const { gl } = useThree();
    const { texture: orderBookTexture, spotPrice, size } = useOrderBookDataTexture(symbol);
    const pointsRef = useRef<THREE.Points>(null);

    // GPGPU State
    const gpuCompute = useMemo(() => new GPUComputationRenderer(size, size, gl), [gl, size]);
    const variables = useRef<{ positionVar: any } | null>(null);

    // Init GPUCompute ONLY ONCE
    useEffect(() => {
        const dtPosition = gpuCompute.createTexture();
        const posArray = dtPosition.image.data;
        if (!posArray) return;

        // Init Random Positions
        for (let i = 0; i < posArray.length; i += 4) {
            const r = 10 + Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            posArray[i] = r * Math.cos(theta); // X
            posArray[i + 1] = (Math.random() - 0.5) * 10; // Y
            posArray[i + 2] = r * Math.sin(theta); // Z
            posArray[i + 3] = 1;
        }

        const positionVar = gpuCompute.addVariable('uCurrentPosition', SIMULATION_SHADER, dtPosition);
        gpuCompute.setVariableDependencies(positionVar, [positionVar]);

        positionVar.material.uniforms.uTime = { value: 0 };
        positionVar.material.uniforms.uSpotPrice = { value: 0 };
        positionVar.material.uniforms.uOrderBookData = { value: null };

        const error = gpuCompute.init();
        if (error !== null) console.error(error);

        variables.current = { positionVar };
    }, [gpuCompute]);

    // Update Uniforms Every Frame
    useFrame((state) => {
        if (!variables.current || !orderBookTexture) return;
        const { positionVar } = variables.current;

        // Feed the live data texture to the simulation shader
        positionVar.material.uniforms.uOrderBookData.value = orderBookTexture;
        positionVar.material.uniforms.uSpotPrice.value = spotPrice;
        positionVar.material.uniforms.uTime.value = state.clock.elapsedTime;

        // Compute new positions
        gpuCompute.compute();

        // Feed new positions AND data to the render shader
        if (pointsRef.current) {
            const mat = pointsRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uPositionTexture.value = gpuCompute.getCurrentRenderTarget(positionVar).texture;
            mat.uniforms.uOrderBookData.value = orderBookTexture;
        }
    });

    // Geometry Generation (UVs)
    const particles = useMemo(() => {
        const p = new Float32Array(size * size * 3);
        const uv = new Float32Array(size * size * 2);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const k = (i * size + j);
                p[k * 3] = 0; p[k * 3 + 1] = 0; p[k * 3 + 2] = 0;
                uv[k * 2] = j / (size - 1);
                uv[k * 2 + 1] = i / (size - 1);
            }
        }
        return { positions: p, uvs: uv };
    }, [size]);

    return (
        <group rotation={[0, 0, 0]} position={[0, -2, 0]}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
                    <bufferAttribute attach="attributes-uv" args={[particles.uvs, 2]} />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={RENDER_VERTEX}
                    fragmentShader={RENDER_FRAGMENT}
                    uniforms={{
                        uPositionTexture: { value: null },
                        uOrderBookData: { value: orderBookTexture }
                    }}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            {/* Visual Context Elements (Floor, Labels) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <ringGeometry args={[0, 30, 64]} />
                <meshBasicMaterial color="#000" opacity={0.8} transparent />
            </mesh>
            <Float speed={2}>
                <Text position={[0, 3, 0]} fontSize={1.2} color="white" font="/fonts/Inter-Bold.woff" anchorX="center">
                    ${spotPrice.toFixed(4)}
                </Text>
            </Float>
        </group>
    );
}
