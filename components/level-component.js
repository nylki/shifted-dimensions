
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {levelComponent};


let levelComponent = AFRAME.registerComponent('level', {
  schema: {
    difficulty: {type: 'number', default: -1}
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.sceneEl.systems['game-state'];
    this.wallContainer = document.getElementById('wallContainer');

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
      collidesOthers: true
    });
    wall.setAttribute('labyrinth-material', '');
    return wall;
    
  },
  update: function () {
    // Create new level
    const difficulty = this.data.difficulty;
    // Skip level -1 because it is assumed predefined in the HTML
    if(difficulty === -1) return;
    if(difficulty === 0) {
      this.wallContainer.innerHTML = '';
      //create some walls and place the lost stone
      console.log('Create new walls!');
      for (let i = 0; i < 10; i++) {
        let wall = this.getNewWall(1,1,0.1);
        wall.setAttribute('position', {
          x: (Math.random() * 3) -1.5,
          y: (Math.random() * 3) -1.5,
          z: (Math.random() * 3) -1.5
        });
        
        wall.setAttribute('rotation',{
        x: Math.random() * 180,
        y: Math.random() * 180,
        z: Math.random() * 180
      });
        console.log('wall', i);
        console.log(wall);
        this.wallContainer.appendChild(wall);
        console.log(this.wallContainer);
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