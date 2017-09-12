
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`
import {speak} from './speak.js';
export {levelComponent};


let levelComponent = AFRAME.registerComponent('level', {
  schema: {
    difficulty: {type: 'number', default: 1}
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.sceneEl.systems['game-state'];
    this.wallContainer = this.gameState.wallContainer;
    this.stoneContainer = this.gameState.stoneContainer;

  },
  
  getNewWall: function (w,h,d, dist) {
    
    let wall = document.createElement('a-entity');
    wall.classList.add('wall');
    wall.setAttribute('geometry', {
      width: w,
      height: h,
      depth: d,
      primitive: 'box',
      buffer: false,
      skipCache: true
    });
    
    wall.setAttribute('physics-body', {
      mass:0.00,
      collidesOthers: false
    });

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
  
    return wall;
    
  },
  getNewStone: function (w,h,d) {
    let stone = document.createElement('a-entity');
    stone.classList.add('lostStone');
    stone.setAttribute('mixin', 'sphere');
    stone.setAttribute('physics-body', {
      mass:0.00,
      collidesOthers: true
    });
    stone.setAttribute('lost-stone-material', '');
    return stone;
  },
  reloadLevel: function () {
    this.update();
  },
  
  update: function () {
    // Create new level
    const difficulty = this.data.difficulty;
    // Skip level -1 because it is assumed predefined in the HTML
    if(difficulty === 1) {
      
      speak('Hello! You lost your precious energy stones in a shifted dimension. Use your magic light controller to make them visible and pull them closer to you. Collect them by touching. Each stone you collect will refill your energy bar. But be careful: your magic controller will drain energy when used.');
    }
    if(difficulty > 1) {
      
      this.wallContainer.innerHTML = '';

      // create prototype walls for merging geometry
      let dist = 3 + difficulty;
      let prototypeWalls = [];
      
      for (let i = 0; i < 20; i++) {

        
        let wall = this.getNewWall(Math.random() + 0.5,Math.random() + 0.5,Math.random(), dist + 1);
        wall.setAttribute('labyrinth-material', {
          color: `hsl(${Math.round(Math.random() * 360)}, ${Math.round(Math.random() * 60)}%, ${Math.round(Math.random() * 50)}%)`
        });
        
        wall.id = 'pwall-' + i;
        prototypeWalls.push(wall);
        setTimeout(() => {
          this.wallContainer.appendChild(wall);
        }, i * 500);
      }
      
      // create additional walls, the higher the level the more
      for (let i = 0; i < 35 * difficulty; i++) {
        let wall = this.getNewWall(Math.random() + 0.5,Math.random() + 0.5,Math.random(), dist + 1);
        let randomIndex =  Math.floor(Math.random() * prototypeWalls.length);
        wall.setAttribute('labyrinth-material', {
          color: `hsl(${Math.round(Math.random() * 360)}, ${Math.round(Math.random() * 60)}%, ${Math.round(Math.random() * 50)}%)`
        });
        
        // TODO: Does the merging it actually work??
        wall.setAttribute('geometry', 'mergeTo', '#pwall-' + randomIndex);

        setTimeout(() => {
          this.wallContainer.appendChild(wall);
        }, i * 500);
        
      }
      

      for (let i = 0; i < (difficulty * 2) - 1; i++) {
        let stone = this.getNewStone(
          0.3 + Math.random() * 0.4,
          0.3 + Math.random() * 0.4,
          0.3 + Math.random() * 0.4
        );
        
        stone.setAttribute('position', {
          x: (Math.random() * dist) -dist/2,
          y: (Math.random() * dist/2),
          z: (Math.random() * dist) -dist/2
        });
        
        
        this.stoneContainer.appendChild(stone);
        this.gameState.lostStones.push(stone);
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
