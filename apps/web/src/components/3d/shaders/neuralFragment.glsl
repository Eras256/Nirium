// Neural Particle Fragment Shader
// Creates glowing neural nodes with electric cyan emission

uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uEmissionColor;

varying vec3 vPosition;
varying float vLife;
varying float vDistanceToCursor;

void main() {
  // Create circular particle with soft edges
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  // Discard pixels outside the particle radius
  if (dist > 0.5) discard;
  
  // Soft glow falloff
  float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
  
  // Core glow (brighter center)
  float core = 1.0 - smoothstep(0.0, 0.2, dist);
  
  // Pulsating effect based on time and life
  float pulse = sin(uTime * 2.0 + vLife * 10.0) * 0.3 + 0.7;
  
  // Cursor proximity increases brightness
  float cursorGlow = smoothstep(3.0, 0.5, vDistanceToCursor);
  
  // Mix base color with emission
  vec3 baseCol = uBaseColor * (0.5 + vLife * 0.5);
  vec3 emission = uEmissionColor * (core * 2.0 + cursorGlow * 1.5) * pulse;
  
  vec3 finalColor = baseCol + emission;
  
  // Add electric sparkle effect near cursor
  if (cursorGlow > 0.3) {
    float sparkle = fract(sin(dot(vPosition.xy * uTime, vec2(12.9898, 78.233))) * 43758.5453);
    if (sparkle > 0.98) {
      finalColor += vec3(1.0, 1.0, 1.0) * 2.0;
    }
  }
  
  // HDR bloom-ready output
  gl_FragColor = vec4(finalColor, alpha * vLife);
}
