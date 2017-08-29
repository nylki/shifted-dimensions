export {labyrinthMaterial};

const vertexShader = `
varying vec2 vUv;
varying vec4 worldPosition;
varying vec3 u_cameraPos;

void main() {
  vUv = uv;
  worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 v = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = v;
}
`;
const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_controllerPos;

varying vec4 worldPosition;

void main(void)
{
  vec3 dir = u_controllerPos - worldPosition.xyz;
  float dist = length(dir);
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	gl_FragColor = vec4(worldPosition.xyz, dist * 0.1);
  
}
`;

let labyrinthMaterial = AFRAME.registerComponent('labyrinth-material', {
  schema: {
    // Add properties.
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.system = this.sceneEl.systems['game-state'];
    this.magicLight = document.querySelector('#laser');
    this.camera = document.querySelector('#camera');
    const data = this.data;
    this.material  = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        color: { value: new THREE.Color(data.color) },
        u_controllerPos: {value: this.camera.object3D.position/*this.magicLight.object3D.position*/},
      },
      vertexShader,
      fragmentShader,
      transparent: true
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
    // console.log(JSON.stringify(this.camera.object3D.position));

    this.material.uniforms.u_time.value = t / 1000;
    this.material.uniforms.u_controllerPos.value = this.camera.object3D.position;//this.magicLight.object3D.position;
    // console.log(this.camera.object3D.position.z);

    // add more uniforms like magic light dir and pos
  }
});
