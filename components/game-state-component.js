
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

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
    this.lostStone = document.getElementById('lostStone');
    console.log(this.lostStone);
    this.magicLight = document.querySelector('#magicLight');
    this.grabber = document.querySelector('#grabber');
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
    this.oscillator.type = 'triangle'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    this.oscillator.frequency.value = 0; // value in hertz
    this.oscillator.detune.value = 100;

    this.gainNode = this.audioCtx.createGain();
    //
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    this.oscillator.start();
    
    
    this.grabber.addEventListener('mousedown', function (e) {
      console.log(e);
    });
    
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
    
    this.slowTick = AFRAME.utils.throttle(this.slowTick, SLOWTICKDELAY, this);
    this.wallTouchWarning = AFRAME.utils.throttle(this.wallTouchWarning, 4000, this);
    
  },
  tick: function (time, timeDelta) {
    this.lastFinish += timeDelta;
    this.time = time;
    if(this.energy <= 0 && this.lostGame === false) {
      this.lostGame = true;
      this.endGame();
      return;
    }
    
    if(this.magicLight.triggerPressed) {
      this.energy--;
    }
    
      
    // let vel = this.lostStone.components['physics-body'].velocity.length();
    // this.dirLightStone.copy(this.magicLight.object3D.position).sub(this.lostStone.object3D.position);
    // let controllerDistSound = this.dirLightStone.length() * maxFreq;
    // let stoneSpeedSound = maxFreq * vel * 100.0;
    // let baseFreq = maxFreq;
    // this.oscillator.frequency.value = Math.min((1/3) * (baseFreq + controllerDistSound + stoneSpeedSound), maxFreq);

    this.oscillator.frequency.value = 440;
    this.gainNode.gain.value =  0.03 * Math.max(0.0, 1.0 - this.headCollisionDistance);

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

    // console.log(this.energy);
    this.energyIndicators.forEach(indicator => indicator.setAttribute('energy-indicator', {value: this.energy}));
  },
  slowTick: function (t, dt) {
    // Check if grabber is very close to stone
    // console.log('SLOW TICK');
    // console.log(this.grabber.object3D.position.distanceTo(this.lostStone.object3D.position));
    this.energy-=20;
    if(this.lastFinish > 5000 && this.grabber.object3D.position.distanceTo(this.lostStone.object3D.position) < 0.1) {
      this.nextLevel();
    }
    
  },
  wallTouchWarning: function () {
    speak('dont touch the walls!');
  },
  nextLevel: function () {
    this.lostGame = false;
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
    // TODO: show menu with: start from level 0; retry current level; exit vr;
    
  }
  
});
