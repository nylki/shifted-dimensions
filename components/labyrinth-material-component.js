export {labyrinthMaterial};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
void main(void)
{
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	gl_FragColor = vec4(0.0, sin(u_time), 0.0, 1.0);
}
`;

let labyrinthMaterial = AFRAME.registerComponent('labyrinth-material', {
  schema: {
    // Add properties.
  },
  init: function () {
    const data = this.data;
    this.material  = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        color: { value: new THREE.Color(data.color) }
      },
      vertexShader,
      fragmentShader
    });
    this.applyToMesh();
    this.el.addEventListener('model-loaded', () => this.applyToMesh());
  },
  update: function () {
    this.material.uniforms.color.value.set(this.data.color);
  },
  applyToMesh: function() {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material = this.material;
    }
  },
  tick: function (t) {
    this.material.uniforms.u_time.value = t / 1000;
    // add more uniforms like magic light dir and pos
  }
});
