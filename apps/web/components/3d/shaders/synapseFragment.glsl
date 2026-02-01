// Synapse Connection Fragment Shader
// Electric arcs between neurons with transmission effect

uniform float uTime;
uniform vec3 uSynapseColor;

varying float vConnectionStrength;
varying float vProgress;

void main() {
  // Base synapse color with strength-based intensity
  vec3 color = uSynapseColor;
  
  // Transmission pulse traveling along the synapse
  float pulse = fract(uTime * 2.0 - vProgress);
  float pulseBrightness = smoothstep(0.0, 0.1, pulse) * smoothstep(0.3, 0.1, pulse);
  
  // Fade at endpoints
  float endpointFade = smoothstep(0.0, 0.1, vProgress) * smoothstep(1.0, 0.9, vProgress);
  
  // Electric flicker
  float flicker = 0.8 + 0.2 * sin(uTime * 20.0 + vProgress * 50.0);
  
  // Final alpha based on connection strength (opacity = 1.0 - d/ε)
  float alpha = vConnectionStrength * endpointFade * flicker;
  
  // Add pulse glow
  color += vec3(0.2, 0.5, 1.0) * pulseBrightness * 2.0;
  
  gl_FragColor = vec4(color, alpha * 0.6);
}
