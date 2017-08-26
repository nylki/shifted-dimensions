
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {gameStateSystem};


let gameStateSystem = AFRAME.registerSystem('game-state', {
  schema: {
    level: {type: 'number', default: 1}
  },
  init: function () {

  },
  tick: function () {

  }

});
