
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`
import {speak} from './speak.js';
export {levelComponent};


let levelComponent = AFRAME.registerComponent('level', {
  schema: {
    difficulty: {type: 'number', default: -1}
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.sceneEl.systems['game-state'];
    this.wallContainer = this.gameState.wallContainer;
    this.stoneContainer = this.gameState.stoneContainer;

  },
  getNewWall: function (w,h,d) {
    
    let wall = document.createElement('a-box');
    wall.classList.add('wall');
    wall.setAttribute('geometry', {
      width: w,
      height: h,
      depth: d
    });
    wall.setAttribute('physics-body', {
      mass:0.00,
      collidesOthers: false
    });
    wall.setAttribute('labyrinth-material', '');
    return wall;
    
  },
  getNewStone: function (w,h,d) {
    let stone = document.createElement('a-box');
    stone.classList.add('lostStone');
    stone.setAttribute('mixin', 'sphere');
    stone.setAttribute('physics-body', {
      mass:0.00,
      collidesOthers: true
    });
    stone.setAttribute('lost-stone-material', '');
    return stone;
  },
  
  update: function () {
    // Create new level
    const difficulty = this.data.difficulty;
    // Skip level -1 because it is assumed predefined in the HTML
    if(difficulty === -1) {
      
      // speak('Welcome! You lost your precious energy stones in a alternate dimension. Use your magic light controller to make them visible and pull them closer to you. Collect them by touching. Each stone you collect will refill your energy bar. But be careful: your magic controller will drain energy when used.');
    }
    if(difficulty === 0) {
      
      
      
      this.wallContainer.innerHTML = '';
      let labyrinth = document.createElement('a-entity');
      labyrinth.setAttribute('lsystem', {
        axiom: 'X',
        productions: 'X:^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->',
        segmentMixins: 'F:line',
        angle: 90,
        iterations: 3,
        translateAxis: 'X',
        mergeGeometries: true
        
      });
      
      //
      // setTimeout(() => {
      //   console.log(labyrinth);
      //   labyrinth.childNodes[0].setAttribute('labyrinth-material', '');
      // }, 5000);
            
      this.wallContainer.appendChild(labyrinth);
      
      
      
      
      //create some walls and place the lost stone
      console.log('Create new walls!');
      for (let i = 0; i < 50; i++) {
        let wall = this.getNewWall(1,1,0.1);
        let dist = 10;
        wall.setAttribute('position', {
          x: (Math.random() * dist) -dist/2,
          y: (Math.random() * dist) -dist/2,
          z: (Math.random() * dist) -dist/2
        });
        
        wall.setAttribute('rotation',{
        x: Math.random() * 180,
        y: Math.random() * 180,
        z: Math.random() * 180
      });
        this.wallContainer.appendChild(wall);
      }
      
      console.log('ADD STONES');
      for (let i = 0; i < 6; i++) {
        console.log('stone', i);
        let stone = this.getNewStone(
          0.05 + Math.random() * 0.3,
          0.05 + Math.random() * 0.3,
          0.05 + Math.random() * 0.3
        );
        
        let dist = 11;
        stone.setAttribute('position', {
          x: (Math.random() * dist) -dist/2,
          y: (Math.random() * dist) -dist/2,
          z: (Math.random() * dist) -dist/2
        });
        
        
        this.stoneContainer.appendChild(stone);
        this.gameState.lostStones.push(stone);
        console.log(i);
        console.log(this.gameState.lostStones.length);
          
      }
      
    } else {
      //create some walls and place the lost stone
    }
  },
  
  tick: function () {

  },
  remove: function () {
  }
});
