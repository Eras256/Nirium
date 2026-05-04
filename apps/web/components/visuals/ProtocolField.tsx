// @ts-nocheck
'use client';

import { useFrame, useThree, extend } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three-stdlib';

// --- SHADERS ---

// Velocity Shader: Calculates particle movement physics
const fragmentShaderVelocity = `
    uniform float uTime;
    uniform vec3 uCursor;
    uniform float uCursorActive;
    
    // Curl noise function for organic fluid movement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    vec3 curlNoise(vec3 p) {
        const float e = 0.1;
        float n1 = snoise(vec2(p.x, p.y));
        float n2 = snoise(vec2(p.y, p.z));
        float n3 = snoise(vec2(p.z, p.x));
        
        vec3 ox = vec3(n2 - snoise(vec2(p.y + e, p.z)), snoise(vec2(p.z + e, p.x)) - n3, snoise(vec2(p.x + e, p.y)) - n1);
        vec3 oy = vec3(snoise(vec2(p.y - e, p.z)) - n2, n3 - snoise(vec2(p.z - e, p.x)), n1 - snoise(vec2(p.x - e, p.y)));
        
        return normalize(ox); // Simplified curl approximation
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D(texturePosition, uv);
        vec4 tmpVel = texture2D(textureVelocity, uv);

        vec3 pos = tmpPos.xyz;
        vec3 vel = tmpVel.xyz;

        // Base movement: Curl Noise
        vec3 curl = curlNoise(pos * 0.2 + uTime * 0.1);
        vel += curl * 0.005;

        // Attractor physics: F = k / r^2
        vec3 toCursor = uCursor - pos;
        float dist = length(toCursor) + 0.1; // Add epsilon to avoid division by zero
        vec3 force = normalize(toCursor) * (15.0 / (dist * dist)); // Strength k=15.0
        
        if (uCursorActive > 0.5) {
             vel += force * 0.0005;
        }
        
        // Drag / Friction
        vel *= 0.96;

        gl_FragColor = vec4(vel, 1.0);
    }
`;

// Position Shader: Updates particle positions based on velocity
const fragmentShaderPosition = `
    uniform float uTime;
    uniform float uDelta;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D(texturePosition, uv);
        vec4 tmpVel = texture2D(textureVelocity, uv);

        vec3 pos = tmpPos.xyz;
        vec3 vel = tmpVel.xyz;

        pos += vel * uDelta * 60.0; // Scale standard delta to 60fps unit

        // Boundary wrap-around (Infinite space illusion)
        if (pos.x > 30.0) pos.x -= 60.0;
        if (pos.x < -30.0) pos.x += 60.0;
        if (pos.y > 30.0) pos.y -= 60.0;
        if (pos.y < -30.0) pos.y += 60.0;
        if (pos.z > 30.0) pos.z -= 60.0;
        if (pos.z < -30.0) pos.z += 60.0;

        gl_FragColor = vec4(pos, 1.0);
    }
`;

// Render Vertex Shader: Translates texture data to 3D points
const renderVertexShader = `
    attribute vec2 reference;
    uniform sampler2D texturePosition;
    uniform float uSize;
    uniform vec3 uColor;
    
    varying vec3 vColor;
    varying float vDistance;

    void main() {
        vec3 pos = texture2D(texturePosition, reference).xyz;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Distance based sizing (Perspective)
        gl_PointSize = uSize * (100.0 / -mvPosition.z);
        
        // Color variation based on depth
        float depth = smoothstep(-30.0, 30.0, pos.z);
        // Color variation based on depth mixed with dynamic uColor
        vColor = mix(uColor, vec3(0.83, 0.68, 0.21), depth); // Dynamic Color to Gold
        vDistance = -mvPosition.z;
    }
`;

// Render Fragment Shader: Draws the particle point
const renderFragmentShader = `
    varying vec3 vColor;
    varying float vDistance;

    void main() {
        // Circular particle
        vec2 uv = gl_PointCoord.xy - 0.5;
        float dist = length(uv);
        
        if (dist > 0.5) discard;
        
        // Soft glow edge
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        
        // Facade fade out
        float fade = smoothstep(50.0, 0.0, vDistance);

        gl_FragColor = vec4(vColor, alpha * fade * 0.8);
    }
`;

const PARTICLE_COUNT = 50000; // The Institutional Goal
const WIDTH = Math.ceil(Math.sqrt(PARTICLE_COUNT));

interface NeuralFieldProps {
    intensity?: number;
    color?: string;
}

export function ProtocolField({ intensity = 1.0, color = "#00f2ff" }: { intensity?: number; color?: string }) {
    const { gl, viewport, mouse } = useThree();
    const gpuCompute = useRef<GPUComputationRenderer | null>(null);

    // Data Textures
    const velocityVariable = useRef<any>(null);
    const positionVariable = useRef<any>(null);

    // References to shader uniforms
    const velocityUniforms = useRef<any>(null);
    const positionUniforms = useRef<any>(null);
    const renderUniforms = useRef<any>({
        texturePosition: { value: null },
        uSize: { value: 1.5 * intensity },
        uColor: { value: new THREE.Color(color) }
    });

    const particlesRef = useRef<THREE.Points>(null);

    // Update uniforms when props change
    useEffect(() => {
        if (renderUniforms.current.uSize) {
            renderUniforms.current.uSize.value = 1.5 * intensity;
        }
    }, [intensity]);

    useEffect(() => {
        if (renderUniforms.current.uColor) {
            renderUniforms.current.uColor.value.set(color);
        }
    }, [color]);

    // Initialize GPGPU
    useMemo(() => {
        // Create GPU Computation Renderer
        const gpu = new GPUComputationRenderer(WIDTH, WIDTH, gl);

        // --- 1. Create Initial Data ---
        const dtPosition = gpu.createTexture();
        const dtVelocity = gpu.createTexture();

        const posArray = dtPosition.image.data;
        const velArray = dtVelocity.image.data;

        if (!posArray || !velArray) {
            console.error("GPGPU Textures could not be initialized");
            return;
        }

        for (let i = 0; i < posArray.length; i += 4) {
            // Random spread in a cube
            posArray[i + 0] = (Math.random() - 0.5) * 60; // x
            posArray[i + 1] = (Math.random() - 0.5) * 60; // y
            posArray[i + 2] = (Math.random() - 0.5) * 60; // z
            posArray[i + 3] = 1.0; // w

            velArray[i + 0] = (Math.random() - 0.5) * 0.1; // vx
            velArray[i + 1] = (Math.random() - 0.5) * 0.1; // vy
            velArray[i + 2] = (Math.random() - 0.5) * 0.1; // vz
            velArray[i + 3] = 1.0; // w
        }

        // --- 2. Add Variables ---
        velocityVariable.current = gpu.addVariable('textureVelocity', fragmentShaderVelocity, dtVelocity);
        positionVariable.current = gpu.addVariable('texturePosition', fragmentShaderPosition, dtPosition);

        // --- 3. Dependencies ---
        gpu.setVariableDependencies(velocityVariable.current, [positionVariable.current, velocityVariable.current]);
        gpu.setVariableDependencies(positionVariable.current, [positionVariable.current, velocityVariable.current]);

        // --- 4. Uniforms ---
        velocityUniforms.current = velocityVariable.current.material.uniforms;
        velocityUniforms.current.uTime = { value: 0 };
        velocityUniforms.current.uCursor = { value: new THREE.Vector3(0, 0, 0) };
        velocityUniforms.current.uCursorActive = { value: 0 };

        positionUniforms.current = positionVariable.current.material.uniforms;
        positionUniforms.current.uTime = { value: 0 };
        positionUniforms.current.uDelta = { value: 0 };

        // Check for errors
        const error = gpu.init();
        if (error !== null) {
            console.error(error);
        }

        gpuCompute.current = gpu;
    }, [gl]);

    // Geometry References (UV mapping for texture lookups)
    const references = useMemo(() => {
        const refs = new Float32Array(WIDTH * WIDTH * 2);
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            const x = (i % WIDTH) / WIDTH;
            const y = Math.floor(i / WIDTH) / WIDTH;
            refs[i * 2] = x;
            refs[i * 2 + 1] = y;
        }
        return refs;
    }, []);

    // Animation Loop
    useFrame((state, delta) => {
        if (!gpuCompute.current) return;

        // Update Uniforms
        const time = state.clock.elapsedTime;
        velocityUniforms.current.uTime.value = time;
        positionUniforms.current.uTime.value = time;
        positionUniforms.current.uDelta.value = delta;

        // Cursor Interaction projected to 3D plane (z=0 for now)
        const x = (mouse.x * viewport.width) / 2;
        const y = (mouse.y * viewport.height) / 2;
        velocityUniforms.current.uCursor.value.set(x, y, 0);
        velocityUniforms.current.uCursorActive.value = 1.0; // Always active for now

        // Compute step
        gpuCompute.current.compute();

        // Update Render Material
        if (particlesRef.current) {
            const material = particlesRef.current.material as THREE.ShaderMaterial;
            material.uniforms.texturePosition.value = gpuCompute.current.getCurrentRenderTarget(positionVariable.current).texture;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-reference" // Custom attribute for shader
                    count={references.length / 2}
                    array={references}
                    itemSize={2}
                    args={[references, 2]}
                />
                <bufferAttribute
                    attach="attributes-position"
                    count={WIDTH * WIDTH}
                    array={new Float32Array(WIDTH * WIDTH * 3)} // Placeholder, overridden by shader
                    itemSize={3}
                    args={[new Float32Array(WIDTH * WIDTH * 3), 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                uniforms={renderUniforms.current}
                vertexShader={renderVertexShader}
                fragmentShader={renderFragmentShader}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent={true}
            />
        </points>
    );
}
