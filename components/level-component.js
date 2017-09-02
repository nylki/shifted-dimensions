
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

  },
  getNewWall: function (w,h,d) {
    
    let wall = document.createElement('wall');
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
      //create some walls and place the lost stone
      let walls = [];
      for (var i = 0; i < 5; i++) {

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
