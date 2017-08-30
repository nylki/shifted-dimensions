
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {gameStateSystem};

const maxFreq = 300;
const maxVol = 0.1;


let gameStateSystem = AFRAME.registerSystem('game-state', {
  schema: {
    level: {type: 'number', default: 1}
  },
  init: function () {
    
    this.sceneEl = document.querySelector('a-scene');
    this.camera = document.getElementById('camera');
    this.lostStone = document.getElementById('lostStone');
    console.log(this.lostStone);
    this.magicLight = document.querySelector('#laser');
    
    // Pre-create some vectors to avoid doing that in tick()'s
    this.dirLightStone = new THREE.Vector3();
    
    // Init audio foo
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'square'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    this.oscillator.frequency.value = 0; // value in hertz
    this.oscillator.detune.value = 100;
    this.oscillator.start();
    
    this.gainNode = this.audioCtx.createGain();
    
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    
    
    
    
  },
  tick: function (time, timeDelta) {
    
    let vel = this.lostStone.components['physics-body'].velocity.length();
    this.dirLightStone.copy(this.camera.object3D.position).sub(this.lostStone.object3D.position);
    this.oscillator.frequency.value = (Math.sin(time * 0.0005) * maxFreq) * (vel * 100.0);

    this.gainNode.gain.value = (1.0 / this.dirLightStone.length()) * 1.0 * maxVol;
  }
  
});
