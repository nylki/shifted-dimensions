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
uniform vec3 color;
uniform vec2 u_resolution;
uniform vec3 u_controllerPos;
uniform vec3 u_controllerLookDir;
uniform bool u_controllerActive;
uniform float u_triggerDuration;
uniform vec3 u_velocity;

varying vec4 worldPosition;
varying vec2 vUv;

void main(void)
{
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 controllerDir = u_controllerPos - worldPosition.xyz;
  float dist = length(controllerDir) * 0.15;
  

  controllerDir = normalize(controllerDir);
  float dot = dot(u_controllerLookDir, controllerDir);
  float angle = acos(dot) / PI;
  
  if(!u_controllerActive) {
      angle = 1.0 - length(u_velocity) * 800.0;
  }
  
  float sharpAngle = smoothstep(0.0, 0.2, angle);
  

  vec2 toCenter = vec2(0.5) - vUv;
  float planeAngle = atan(toCenter.y,toCenter.x);
  float planeDist = distance(vUv, vec2(0.5)) * 2.0;
  
  float num = 10.0;
  float grayscale = abs(sin(planeAngle * num/2.0));

  grayscale = mix(grayscale, planeDist, sin(u_time * 2.0) * 2.0);
  
  vec3 mask = vec3(step(grayscale, 0.5));
  
  // Final color is the mask, transparency too, but is scaled by angle to controller
  // and speed of stone
  gl_FragColor = vec4(mask * color,  mask.x * (1.0 - sharpAngle));
  
  
  
  
}
`;

let lostStoneMaterial = AFRAME.registerComponent('lost-stone-material', {
  schema: {
    color: {default: 'rgb(14, 128, 159)'}
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
        u_controllerActive: {value: this.gameState.magicLight.triggerPressed},
        u_triggerDuration: {value: this.gameState.time - this.gameState.magicLight.triggerTime},
        u_velocity: {value: new THREE.Vector3(0,0,0)}

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
    this.material.uniforms.u_velocity.value = this.el.components['physics-body'].velocity;
    this.material.uniforms.u_controllerPos.value = this.gameState.magicLight.object3D.position;
    this.material.uniforms.u_controllerLookDir.value = this.gameState.magicLight.object3D.getWorldDirection();
    let triggerPressed = this.gameState.magicLight.components['magic-light'].triggerPressed;
    this.material.uniforms.u_controllerActive.value = triggerPressed;
    if(triggerPressed) {
      this.material.uniforms.u_triggerDuration.value = this.gameState.time - this.gameState.magicLight.triggerTime;
    }
  
    
    

    // add more uniforms like magic light dir and pos
  }
});
