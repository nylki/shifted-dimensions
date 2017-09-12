
// INFO regarding module export syntax here:
// This file/module uses named exports to export both system and component in one module.
// This won't negatively affect file size after uglifying, because unused let statements
// are discarded; eg: `let fooBarComponent = AFRAME.registerComponent(...)` becomes `AFRAME.registerComponent(...)`

export {pseudoPhysicsSystem, physicsBodyComponent};


let pseudoPhysicsSystem = AFRAME.registerSystem('pseudo-physics', {
  schema: {
    gravity: {type: 'vec3', default: new THREE.Vector3(0, -0.001, 0)},
    drag: {type: 'number', default: 0.996}
  },
  init: function () {
    this.children = [];
    this.colliders = [];
    this.futurePos = new THREE.Vector3();
    this.futureChildBox = new THREE.Box3();
    this.futureColliderBox = new THREE.Box3();
    this.futureBSphere = new THREE.Sphere();
    
  },
  tick: function () {
    for (let child of this.children) {
      child.acceleration.multiplyScalar(0).add(this.data.gravity).multiplyScalar(child.data.mass);
      child.velocity.add(child.acceleration);
      this.futurePos.copy(child.el.object3D.position).add(child.velocity);
      
      
      // Check for collision
      if(child.data.collidesAgainst) {
        
        
        //
        // INFO: Planned to have some basic collision detection and bouncing of surfaces
        // but scrapped it for the final version. You can still check out the commented code below:
        //
        //
        //
        
        this.futureChildBox.setFromCenterAndSize(this.futurePos, child.boundingBoxSize);
      
        for (let collider of this.colliders) {
          // console.log(child, collider);
          if(collider.el === child.el) continue;
          // console.log(JSON.stringify(this.futureColliderBox));
          if(this.futureChildBox.intersectsBox(collider.boundingBox)) {
      
            // more bogus physics: let the object bounce in opposite dir with 1/5 of speed
            child.velocity.multiplyScalar(-0.5);
      
            // avoid constant wobbling in collision situations
            if(child.velocity.length() < 0.001) child.velocity.set(0,0,0);
            // console.log(child.velocity.length());
      
          }
          
          if(child.velocity.length() < 0.000001) child.velocity.set(0,0,0);
          this.futurePos.copy(child.el.object3D.position).add(child.velocity);
        }
      }
      child.velocity.multiplyScalar(this.data.drag);
      if(child.data.gravity !== 0 || child.data.collidesAgainst)
        child.el.setAttribute('position', this.futurePos);
      
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
    this.boundingBox = new THREE.Box3().setFromObject(this.el.object3D);
    // this.boundingSphere = new THREE.Sphere().setFromObject(this.el.object3D);
    this.boundingBoxSize = this.boundingBox.getSize();
    this.system.add(this);
  },
  tick: function () {
      this.boundingBox.setFromObject(this.el.object3D);
      this.boundingBoxSize = this.boundingBox.getSize();
  },
  remove: function () {
    this.system.remove(this);
  }
});
