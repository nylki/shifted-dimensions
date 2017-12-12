
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`
//
import {speak} from './speak.js';
export {gameStateSystem};

const maxFreq = 500;
const maxVol = 0.1;
const SLOWTICKDELAY = 250;
const STARTENERGY = 12000;


let gameStateSystem = AFRAME.registerSystem('game-state', {
  schema: {
    level: {type: 'number', default: 1}
  },
  init: function () {
    
    this.sceneEl = document.querySelector('a-scene');
    this.camera = document.getElementById('camera');
    this.levelEntity = document.getElementById('level');
    this.lostStones = Array.from(document.querySelectorAll('.lostStone'));
    this.magicLight = document.querySelector('#magicLight');

    this.wallContainer = document.querySelector('#wallContainer');
    this.stoneContainer = document.getElementById('stoneContainer');

    this.lastSlowTick = 0;
    this.lastFinish = 0; // the time since the player progressed to the new level
    
    this.lostGame = false;
    this.stoneCollectTime = undefined;
    this.energy = STARTENERGY;
    this.energyLowCondition = false;
    
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
    }

    
    this.distortion.curve = makeDistortionCurve(400);
    this.distortion.oversample = '4x';
    
    this.oscillator.start();
  

    
    
    this.magicLight.addEventListener('raycaster-intersection', (e) => {
      if (this.magicLight.components['magic-light'].triggerPressed) {
        // add acceleration of intersected stone towards magic light
        let stone = e.detail.els[0];
        let magicLightPos = this.magicLight.object3D.position.clone();
        let dir = magicLightPos.sub(stone.object3D.position).normalize();
        stone.components['physics-body'].velocity.add(dir.multiplyScalar(0.001));
      }
    });
    
    this.slowTick = AFRAME.utils.throttle(this.slowTick, SLOWTICKDELAY, this);
    
  },
  tick: function (time, timeDelta) {
    this.lastFinish += timeDelta;
    this.time = time;
    if (this.magicLight.components['magic-light'].triggerPressed) {
      this.energy-=8;
    }
    
    
    let r = 1 - Math.round(Math.random() * 20) / 200; // ca. 0.9 - 1.0
    let baseFreq = 100;

    this.gainNode.gain.value =  0.00;
    if (this.stoneCollectTime !== undefined && time - this.stoneCollectTime < 2500) {
      this.oscillator.frequency.value = r*baseFreq + ((Math.sin((time - this.stoneCollectTime) * 0.0005)) * baseFreq);
      this.gainNode.gain.value =  0.05;
    }
    
    this.slowTick();
    this.magicLight.setAttribute('magic-light', {energy: this.energy});
    
  },
  slowTick: function (t, dt) {
    this.energy-=5;
    for (var i = this.lostStones.length-1; i >= 0; i--) {
      let lostStone = this.lostStones[i];
      if (this.magicLight.object3D.position.distanceTo(lostStone.object3D.position) < 0.1) {
        this.lostStones.splice(i, 1);
        lostStone.parentNode.removeChild(lostStone);
        this.energy = STARTENERGY;
        this.energyLowCondition = false;
        
        this.stoneCollectTime = this.time;
        if (this.lostStones.length !== 0) speak(`${this.lostStones.length} stones remaining.`);
      }
    }
    
    if (!this.energyLowCondition && this.energy < STARTENERGY * 0.2) {
      speak('Energy is low.');
      this.energyLowCondition = true;
    }

    if (this.energy <= 0 && this.lostGame === false) {
      this.lostGame = true;
      this.endGame();
      return;
    }
    if (this.lastFinish > 5000 && this.lostStones.length === 0) {
      speak('You have found the lost stone. Next Level!');
      this.nextLevel();
    }
    
  },
  nextLevel: function (lost) {
    this.energyLowCondition = false;
    this.energy = STARTENERGY;
    this.lastFinish = 0;
    this.stoneCollectTime = undefined;
    
    if (!this.lostGame) {
      this.data.level++;
      this.levelEntity.setAttribute('level', {difficulty: this.data.level});
    } else {
      this.levelEntity.components['level'].reloadLevel();
    }
    
    this.lostGame = false;
    
    
  }, endGame: function () {
    speak('Enery depleted. You lost. Restart current level.');
    this.lostGame = true;
    this.nextLevel();
    // TODO: show menu with: start from level 0; retry current level; exit vr;
    
  }
  
});
