export {magicLight};


let magicLight = AFRAME.registerComponent('magic-light', {
  schema: {
    hand: {default: ''},
    model: {default: 'customControllerModel.gltf'}
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.system = this.sceneEl.systems['game-state'];
    this.triggerPressed = false;
    this.triggerTime = -1;
    
    // this.el.addEventListener('raycaster-intersection', function (e) {
    //   //console.log(e);
    //   if(e.detail.intersections[0].object.el.id === 'lostStone') {
    //     console.log('still hovering lostStone');
    //
    //   }
    // });
    
    this.el.addEventListener('mouseenter', (e) => {
      if(e.detail.intersectedEl.id === 'lostStone') {
        this.gameState.hoveringStone = true;
      }
    });
    this.el.addEventListener('mouseleave', (e) => {
      if(e.detail.intersectedEl.id === 'lostStone') {
        this.gameState.hoveringStone = false;
      }
    });
    
    this.el.addEventListener('buttonchanged', this.onButtonChanged);
    this.el.addEventListener('buttondown', this.onButtonDown);
    this.el.addEventListener('buttonup', this.onButtonUp);
    
    this.el.addEventListener('click', (e) => {
      console.log('click');
      console.log(e.detail.intersectedEl.id);
    });
  },
  onButtonUp: function () {
    this.triggerPressed = false;
    this.triggerTime = this.gameState.time;
    console.log('up');
  },
  onButtonDown: function () {
    this.triggerPressed = true;
    this.triggerTime = -1;
    console.log('down');
  },
  
  update: function () {
    var controlConfiguration = {
      hand: this.data.hand,
      model: false,
      rotationOffset: this.data.hand === 'left' ? 90 : -90
    };
    // Build on top of controller components.
    this.el.setAttribute('vive-controls', controlConfiguration);
    this.el.setAttribute('oculus-touch-controls', controlConfiguration);
    this.el.setAttribute('daydream-controls', controlConfiguration);
    this.el.setAttribute('gearvr-controls', controlConfiguration);
    // Set a model.
    this.el.setAttribute('gltf-model', this.data.model);
  }
});
