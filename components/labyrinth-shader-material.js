export {labyrinthMaterial};

let labyrinthMaterial = AFRAME.registerComponent('labyrinth-material', {
  schema: {
    // Add properties.
  },
  init: function () {
    this.material = this.el.getOrCreateObject3D('mesh').material = new THREE.ShaderMaterial({
      // ...
    });
  },
  update: function () {
    // Update `this.material`.
  }
});
