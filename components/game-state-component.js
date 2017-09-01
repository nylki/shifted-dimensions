
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {gameStateSystem};

const maxFreq = 100;
const maxVol = 0.1;
const SLOWTICKDELAY = 500;


let gameStateSystem = AFRAME.registerSystem('game-state', {
  schema: {
    level: {type: 'number', default: -1}
  },
  init: function () {
    
    this.sceneEl = document.querySelector('a-scene');
    this.camera = document.getElementById('camera');
    this.levelEntity = document.getElementById('level');
    this.lostStone = document.getElementById('lostStone');
    console.log(this.lostStone);
    this.magicLight = document.querySelector('#magicLight');
    this.grabber = document.querySelector('#grabber');
    
    this.lastSlowTick = 0;
    this.lastFinish = 0; // the time since the player progressed to the new level
    
    // Pre-create some vectors to avoid doing that in tick()'s
    this.dirLightStone = new THREE.Vector3();
    
    // Init audio foo
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    this.oscillator = this.audioCtx.createOscillator();
    // this.oscillator.type = 'square'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    // this.oscillator.frequency.value = 0; // value in hertz
    // this.oscillator.detune.value = 100;
    // this.oscillator.start();
    //
    this.gainNode = this.audioCtx.createGain();
    //
    // this.oscillator.connect(this.gainNode);
    // this.gainNode.connect(this.audioCtx.destination);
    
    
    this.grabber.addEventListener('mousedown', function (e) {
      console.log(e);
    });
    
  },
  tick: function (time, timeDelta) {
    
    this.lastFinish += timeDelta;
    let vel = this.lostStone.components['physics-body'].velocity.length();
    this.dirLightStone.copy(this.magicLight.object3D.position).sub(this.lostStone.object3D.position);
    let controllerDistSound = this.dirLightStone.length() * maxFreq;
    let stoneSpeedSound = maxFreq * vel * 100.0;
    let baseFreq = maxFreq;
    this.oscillator.frequency.value = Math.min((1/3) * (baseFreq + controllerDistSound + stoneSpeedSound), maxFreq);

    this.gainNode.gain.value = (1.0 / this.dirLightStone.length()) * 0.5 * maxVol;
    
    this.lastSlowTick += timeDelta;
    if(this.lastSlowTick > SLOWTICKDELAY) {
      this.lastSlowTick = 0;
      this.slowTick();
      // // Calculate angle between controller direction and stone, relative to controller
      // let controllerPos = this.magicLight.object3D.position.clone();
      // let stonePos = this.lostStone.object3D.position.clone();
      //
      // let controllerLookDir = this.magicLight.object3D.getWorldDirection();
      //
      // let stoneControllerDir = new THREE.Vector3().subVectors(stonePos, controllerPos);
      //
      // controllerLookDir.normalize();
      // stoneControllerDir.normalize();
      // let dot = controllerLookDir.dot(stoneControllerDir);
      // let angle = Math.acos(-dot);
      // let normAngle = angle / Math.PI;
      // let degAngle = normAngle / 180;
      // console.log();
      // console.log(angle / (Math.PI / 180));
      // console.speak((angle / Math.PI).toFixed(1))

    }
  },
  slowTick: function () {
    // Check if grabber is very close to stone
    // console.log('SLOW TICK');
    // console.log(this.grabber.object3D.position.distanceTo(this.lostStone.object3D.position));
    if(this.lastFinish < 5000 && this.grabber.object3D.position.distanceTo(this.lostStone.object3D.position) < 0.1) {
      this.nextLevel();
    }
    
  },
  nextLevel: function () {
    if(this.data.level === -1) {
      // Player finished first instructions and intro
    } else if (this.data.level === 0) {
      // player finished super easy level
      
    } else {

    }
    
    this.data.level++;
    this.lastFinish = 0;
  
    console.speak('You have found the lost stone. Next Level!');
    console.info('NEXT LEVEL', this.data.level);
    this.levelEntity.setAttribute('level', {difficulty: this.data.level});
    
  }
  
});
