
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {pseudoPhysicsSystem, physicsBodyComponent};


let pseudoPhysicsSystem = AFRAME.registerSystem('pseudo-physics', {
  schema: {
    gravity: {type: 'vec3', default: new THREE.Vector3(0, -0.001, 0)}
  },  // System schema. Parses into `this.data`.
  init: function () {
    this.children = [];
    this.colliders = [];
    this.futurePos = new THREE.Vector3();
    this.futureBBox = new THREE.Box3();
    this.futureBSphere = new THREE.Sphere();
  },
  tick: function () {
    for (let child of this.children) {
      child.acceleration.multiplyScalar(0).add(this.data.gravity).multiplyScalar(child.data.mass);
      
      child.velocity.add(child.acceleration);
      futurePos.add(child.velocity);
      
      
      // Check for collision
      if(child.data.collidesSelf) {
        console.log(child);
        // this.futureBBox.setFromCenterAndSize(futurePos, child.bboxSize);
        // for (let collider of this.colliders) {
        //   if(this.futureBBox.intersectsBox(collider.object3D.geometry.boundingBox)) {
        //
        //   }
        // }
      }
      

      
      child.el.setAttribute('position', futurePos);

    }
  },
  add: function (child) {
    this.children.push(child);
    if(child.data.collidesOthers) {
      this.colliders.push(child);
    }
  },
  remove: function (child) {
    let index = this.children.indexOf(child);
    this.children.splice(index, 1);
    if(child.data.collidesOthers) {
      let index = this.colliders.indexOf(child);
      this.colliders.splice(index, 1);
    }
  }
  
  // Other handlers and methods.
});

let physicsBodyComponent = AFRAME.registerComponent('physics-body', {
  schema: {
    /* mass affects gravitational effect. A mass of 0 makes the entity unaffected by gravity */
    mass: {type: 'number', default: 1},
    /* static entities are not affected by collisions, but others can collide against it */
    collidesOthers: {type: 'bool', default: false},
    /* Whether the entity collides against other  */
    collidesAgainst: {type: 'bool', default: false}
  },
  init: function () {
    this.velocity = new THREE.Vector3(0,0,0);
    this.acceleration = new THREE.Vector3(0,0,0);
    this.sceneEl = document.querySelector('a-scene');
    this.system = this.sceneEl.systems['pseudo-physics'];
    console.log(this);
    this.boundingBox = new THREE.Box3().setFromObject(this.el.object3D);
    this.boundingSphere = new THREE.Sphere().setFromObject(this.el.object3D);
    this.bboxSize = this.object3D.geometry.boundingBox.getSize();
    this.system.add(this);
  },
  remove: function () {
    this.system.remove(this);
  }
});
