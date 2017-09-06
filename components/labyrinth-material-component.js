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

#define PI 3.1415926538

uniform vec3 color;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_controllerPos;
uniform vec3 u_controllerLookDir;
uniform vec3 u_stonePos;
uniform bool u_controllerActive;
uniform float u_triggerDuration;


varying vec4 worldPosition;



float gain(float x, float k)
{
  float a = 0.5*pow(2.0*((x<0.5)?x:1.0-x), k);
  return (x<0.5)?a:1.0-a;
}

void main(void)
{
  vec3 controllerDir = u_controllerPos - worldPosition.xyz;
  vec3 stoneDir = u_stonePos - worldPosition.xyz;
  float dist = length(controllerDir);
  float stoneDist = length(stoneDir) * 0.3;
	// vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  

  controllerDir = normalize(controllerDir);
  float dot = dot(u_controllerLookDir, controllerDir);
  float angle = acos(dot) / PI;
  
  float normDist = min(dist, 1.0);
  // vec3 c = mix(color, vec3(0.2, 0.2, 0.2), (stoneDist * 5.0));
  if(u_controllerActive == true) {
    float triggerDurSecs = u_triggerDuration / 1000.0;
    float durOpacity = max(0.3, 1.0 - triggerDurSecs * 0.4);
    float angleOpacity = angle * 10.0;
    float opacity = max(min(normDist, 0.4),  durOpacity * angleOpacity);
    gl_FragColor = vec4(color, opacity);
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
  
}
`;

let labyrinthMaterial = AFRAME.registerComponent('labyrinth-material', {
  schema: {
    // Add properties.
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.sceneEl.systems['game-state'];
    // this.el.object3D.renderOrder = 1;
    const data = this.data;
    this.material  = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        color: { value: new THREE.Color(data.color) },
        u_controllerPos: {value: this.gameState.magicLight.object3D.position},
        u_controllerLookDir: {value: this.gameState.magicLight.object3D.getWorldDirection()},
        u_stonePos: {value: this.gameState.lostStone.object3D.position},
        u_controllerActive: {value: this.gameState.magicLight.triggerPressed},
        u_triggerDuration: {value: this.gameState.time - this.gameState.magicLight.triggerTime}


      },
      vertexShader,
      fragmentShader,
      transparent: true,
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
    // console.log(JSON.stringify(this.camera.object3D.position));
    
    this.material.uniforms.u_time.value = t / 1000;
    this.material.uniforms.u_stonePos.value = this.gameState.lostStone.object3D.position;
    this.material.uniforms.u_controllerPos.value = this.gameState.magicLight.object3D.position;
    this.material.uniforms.u_controllerLookDir.value = this.gameState.magicLight.object3D.getWorldDirection();
    
    let triggerPressed = this.gameState.magicLight.components['magic-light'].triggerPressed;
    this.material.uniforms.u_controllerActive.value = triggerPressed;
    if(triggerPressed) {
      this.material.uniforms.u_triggerDuration.value = this.gameState.time - this.gameState.magicLight.components['magic-light'].triggerTime;
    }
  

  
    
    

    // add more uniforms like magic light dir and pos
  }
});
