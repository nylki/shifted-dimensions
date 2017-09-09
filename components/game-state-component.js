
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`
//
import {speak} from './speak.js';
export {gameStateSystem};

const maxFreq = 500;
const maxVol = 0.1;
const SLOWTICKDELAY = 500;
const STARTENERGY = 10000;


let gameStateSystem = AFRAME.registerSystem('game-state', {
  schema: {
    level: {type: 'number', default: -1}
  },
  init: function () {
    
    this.sceneEl = document.querySelector('a-scene');
    this.camera = document.getElementById('camera');
    this.levelEntity = document.getElementById('level');
    this.lostStones = Array.from(document.querySelectorAll('.lostStone'));
    this.magicLight = document.querySelector('#magicLight');

    this.wallContainer = document.querySelector('#wallContainer');
    this.stoneContainer = document.getElementById('stoneContainer');

    this.energyIndicators = document.querySelectorAll('.energyIndicator');
    this.lastSlowTick = 0;
    this.lastFinish = 0; // the time since the player progressed to the new level
    
    this.lostGame = false;
    this.energy = STARTENERGY;
    
    this.headCollisionDistance = 999;
    this.headCollisionDuration = -1;
    this.headCollisionStarted = -1;
    
    // Pre-create some vectors to avoid doing that in tick()'s
    this.dirLightStone = new THREE.Vector3();
    
    // Init audio stuff
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.speechSynth = window.speechSynthesis;
    
    this.oscillator = this.audioCtx.createOscillator();
    this.biquadFilter = this.audioCtx.createBiquadFilter();
    this.gainNode = this.audioCtx.createGain();
    this.distortion = this.audioCtx.createWaveShaper();
    
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.biquadFilter);
    this.biquadFilter.connect(this.distortion);
    this.distortion.connect(this.audioCtx.destination);
    

    
    this.oscillator.type = 'triangle'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    this.oscillator.frequency.value = 0; // value in hertz
    this.oscillator.detune.value = 100;
    
    this.biquadFilter.type = 'lowshelf';
    this.biquadFilter.frequency.value = 300;
    this.biquadFilter.gain.value = 25;
    

    // makeDistortionCurve via https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode#Example
    function makeDistortionCurve(amount) {
      var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
      for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
    };

    
    this.distortion.curve = makeDistortionCurve(400);
    this.distortion.oversample = '4x';
    
    // this.oscillator.start();
    
    
    
    this.camera.addEventListener('raycaster-intersection', (e) => {
      console.log('head touched wall');
      if(this.headCollisionDuration !== -1) {
        this.headCollisionStarted = this.time;
      }
      this.headCollisionDistance = e.detail.intersections[0].distance;
      this.headCollisionDuration = this.time - this.headCollisionStarted;
      console.log(this.headCollisionDistance);
      if(this.headCollisionDistance < 0.2) {
        this.wallTouchWarning();
      }
    });
    
    this.camera.addEventListener('raycaster-intersection-cleared', (e) => {
      console.log('HEAD TOUCHED THE WALL!!', this.headCollisionDuration);
      console.log(e);
      this.headCollisionDuration = this.headCollisionStarted = -1;
      this.headCollisionDistance = 999;
    });
    
    
    
    this.magicLight.addEventListener('raycaster-intersection', (e) => {
      if(this.magicLight.components['magic-light'].triggerPressed) {
        // add acceleration of intersected stone towards magic light
        let stone = e.detail.els[0];
        let magicLightPos = this.magicLight.object3D.position.clone();
        let dir = magicLightPos.sub(stone.object3D.position).normalize();
        stone.components['physics-body'].velocity.add(dir.multiplyScalar(0.001));
      }
    });
    
    this.slowTick = AFRAME.utils.throttle(this.slowTick, SLOWTICKDELAY, this);
    this.wallTouchWarning = AFRAME.utils.throttle(this.wallTouchWarning, 4000, this);
    
  },
  tick: function (time, timeDelta) {
    this.lastFinish += timeDelta;
    this.time = time;
    if(this.magicLight.components['magic-light'].triggerPressed) {
      // console.log(this.energy);
      this.energy-=10;
    }
    
    
    // let vel = this.lostStone.components['physics-body'].velocity.length();
    // this.dirLightStone.copy(this.magicLight.object3D.position).sub(this.lostStone.object3D.position);
    // let controllerDistSound = this.dirLightStone.length() * maxFreq;
    // let stoneSpeedSound = maxFreq * vel * 100.0;
    // let baseFreq = maxFreq;
    // this.oscillator.frequency.value = Math.min((1/3) * (baseFreq + controllerDistSound + stoneSpeedSound), maxFreq);
    let r = 1 - Math.round(Math.random() * 20) / 200; // ca. 0.9 - 1.0
    let baseFreq = 100;
    // console.log(r);
    this.oscillator.frequency.value = r*baseFreq + ((Math.sin(time * 0.005)) * baseFreq);
    this.gainNode.gain.value =  0.5;//0.03 * Math.max(0.0, 1.0 - this.headCollisionDistance);
    
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

    this.magicLight.setAttribute('magic-light', {energy: this.energy});
    
  },
  slowTick: function (t, dt) {
    // console.log('SLOW TICK');
    this.energy-=10;
    
    console.log(this.lostStones.length);
    
    for (var i = this.lostStones.length-1; i >= 0; i--) {
      let lostStone = this.lostStones[i];
      if(this.magicLight.object3D.position.distanceTo(lostStone.object3D.position) < 0.1) {
        this.lostStones.splice(i, 1);
        lostStone.parentNode.removeChild(lostStone);
        this.energy = STARTENERGY;
      }
    }

    if(this.energy <= 0 && this.lostGame === false) {
      this.lostGame = true;
      this.endGame();
      return;
    }
    if(this.lastFinish > 5000 && this.lostStones.length === 0) {
      this.nextLevel();
    }
    
  },
  wallTouchWarning: function () {
    speak('dont touch the walls!');
  },
  nextLevel: function () {
    this.lostGame = false;
    this.energy = STARTENERGY;
    if(this.data.level === -1) {
      // Player finished first instructions and intro
    } else if (this.data.level === 0) {
      // player finished super easy level
      
      
    } else {
      
    }
    
    this.data.level++;
    this.lastFinish = 0;
    
    speak('You have found the lost stone. Next Level!');
    console.info('NEXT LEVEL', this.data.level);
    this.levelEntity.setAttribute('level', {difficulty: this.data.level});
    
  }, endGame: function () {
    speak('Your energy is depleted. You lost. Do you want to try again?');
    this.nextLevel(); // HACK: provisional until proper lost screen
    // TODO: show menu with: start from level 0; retry current level; exit vr;
    
  }
  
});
