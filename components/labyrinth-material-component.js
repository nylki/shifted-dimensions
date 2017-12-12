export {labyrinthMaterial};

const vertexShader = `

varying vec2 vUv;
varying vec4 worldPosition;
varying vec3 u_cameraPos;
varying vec3 vNormal;

void main() {
  vUv = uv;
  worldPosition = modelMatrix * vec4(position, 1.0);
  vNormal = normal;
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
uniform bool u_controllerActive;
uniform float u_triggerDuration;

varying vec2 vUv;
varying vec4 worldPosition;
varying vec3 vNormal;

void main(void)
{
  vec3 controllerDir = u_controllerPos - worldPosition.xyz;
  float dist = length(controllerDir);

  
  
  float shadow = dot(vNormal, normalize(vec3(0.0, 0.3, 0.5)));
  
  
  // add rippling effect to color
  float ripple = sin(u_time + dist*5.0);
  vec3 shadedColor = mix(color * shadow, vec3(ripple), 0.1);

  
  controllerDir = normalize(controllerDir);
  float d = dot(u_controllerLookDir, controllerDir);
  float angle = acos(d) / PI;
  
  float normDist = min(dist, 1.0);
  if(u_controllerActive == true) {
    float triggerDurSecs = u_triggerDuration / 1000.0;
    float durOpacity = max(0.3, 1.0 - triggerDurSecs * 0.4);
    float angleOpacity = angle * 10.0;
    
    float opacity = durOpacity * angleOpacity;
    opacity = max(min(normDist, 0.4),  opacity);
      
    gl_FragColor = vec4(shadedColor, opacity);
  } else {
    gl_FragColor = vec4(shadedColor, 1.0);
  }
  

  
}
`;

let labyrinthMaterial = AFRAME.registerComponent('labyrinth-material', {
  schema: {
    color: {default: 'rgb(192, 214, 145)'}
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
        u_controllerActive: {value: this.gameState.magicLight.triggerPressed},
        u_triggerDuration: {value: this.gameState.time - this.gameState.magicLight.triggerTime},
        u_cameraPos: {value: this.gameState.camera.object3D.position}


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
    this.material.uniforms.u_time.value = t / 1000;
    this.material.uniforms.u_controllerPos.value = this.gameState.magicLight.object3D.position;
    this.material.uniforms.u_controllerLookDir.value = this.gameState.magicLight.object3D.getWorldDirection();
    this.material.uniforms.u_cameraPos = this.gameState.camera.object3D.position;
    
    
    let triggerPressed = this.gameState.magicLight.components['magic-light'].triggerPressed;
    this.material.uniforms.u_controllerActive.value = triggerPressed;
    this.material.transparent = true;
    if (triggerPressed) {
      this.material.transparent = true;
      this.material.uniforms.u_triggerDuration.value = this.gameState.time - this.gameState.magicLight.components['magic-light'].triggerTime;
    }

  }
});
