export {lostStoneMaterial};

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

#define PI 3.1415926538

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_controllerPos;
uniform vec3 u_controllerLookDir;
uniform vec3 u_stonePos;

varying vec4 worldPosition;

void main(void)
{
  vec3 controllerDir = u_controllerPos - worldPosition.xyz;
  vec3 stoneDir = u_stonePos - worldPosition.xyz;
  float dist = length(controllerDir) * 0.15;
  float stoneDist = length(stoneDir) * 0.3;
	// vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  

  controllerDir = normalize(controllerDir);
  float dot = dot(u_controllerLookDir, controllerDir);
  float angle = acos(dot) / PI;
  
  
  
  vec3 color = vec3(0.0, 0.0, 0.0);
	gl_FragColor = vec4(vec3(1.0, stoneDist, stoneDist), 1.0 - angle);
  // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  
}
`;

let lostStoneMaterial = AFRAME.registerComponent('lost-stone-material', {
  schema: {
    // Add properties.
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.sceneEl.systems['game-state'];
    // this.el.object3D.renderOrder = 0;
    const data = this.data;
    this.material  = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        color: { value: new THREE.Color(data.color) },
        u_controllerPos: {value: this.gameState.magicLight.object3D.position},
        u_controllerLookDir: {value: this.gameState.magicLight.object3D.getWorldDirection()},
        u_stonePos: {value: this.gameState.lostStone.object3D.position},
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      visible: true
      
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
  tick: function (t, timeDelta) {
    if(this.gameState.headCollisionDistance <= 0.2 && this.material.visible === true) {
      this.material.visible = false;
    } else if (this.material.visible === false && this.gameState.headCollisionStarted === -1) {
      this.material.visible = true;
    }
    
    this.material.uniforms.u_time.value = t / 1000;
    this.material.uniforms.u_stonePos.value = this.gameState.lostStone.object3D.position;
    this.material.uniforms.u_controllerPos.value = this.gameState.magicLight.object3D.position;
    this.material.uniforms.u_controllerLookDir.value = this.gameState.magicLight.object3D.getWorldDirection();

  
    
    

    // add more uniforms like magic light dir and pos
  }
});
