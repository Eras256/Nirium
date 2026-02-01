// Synapse Connection Vertex Shader
// Dynamic lines between neural particles

uniform float uTime;

attribute vec3 startPosition;
attribute vec3 endPosition;
attribute float connectionStrength;

varying float vConnectionStrength;
varying float vProgress;

void main() {
  // Interpolate along the line based on vertex ID (0 or 1)
  // position.x contains 0.0 for start, 1.0 for end
  float t = position.x;
  vProgress = t;
  
  vec3 pos = mix(startPosition, endPosition, t);
  
  // Add slight wave animation
  float wave = sin(uTime * 3.0 + t * 6.28) * 0.02;
  pos.y += wave * connectionStrength;
  
  vConnectionStrength = connectionStrength;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
