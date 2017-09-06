export {magicLight};


let magicLight = AFRAME.registerComponent('magic-light', {
  schema: {
    hand: {default: ''}
    },
    
  createModel: function () {
    let base = document.createElement('a-box');
    base.setAttribute('material', {color: fuchsia});
    this.el.appendChild(base);
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
  
    // this.el.addEventListener('buttonchanged', this.onButtonChanged.bind(this));
    this.el.addEventListener('buttondown', () => {
      this.triggerPressed = true;
      console.log(this.gameState);
      this.triggerTime = this.gameState.time;
      console.log(this.triggerTime);
      console.log('up');
    });
    this.el.addEventListener('buttonup', () => {
      console.log(this);
      this.triggerPressed = false;
      console.log(this.triggerPressed);
      this.triggerTime = -1;
      console.log('down');
    });
    
    this.el.addEventListener('click', (e) => {
      console.log('click');
      console.log(e.detail.intersectedEl.id);
    });
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
    
    
  }
});
