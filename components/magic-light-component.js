export {magicLight};


let magicLight = AFRAME.registerComponent('magic-light', {
  schema: {
    hand: {default: ''},
    energy: {type: 'number', default: 10000},
    maxEnergy: {type: 'number', default: 10000}
    },
    
  createModel: function () {
    // Create base
    this.hullDimensions = {width: 0.03, height: 0.04, depth: 0.15};
    let baseHull = document.createElement('a-entity');
    baseHull.setAttribute('geometry', Object.assign({primitive: 'box'}, this.hullDimensions));
    baseHull.setAttribute('material', {color: 'rgba(255, 192, 119, 0.3)', transparent: true, opacity: 0.5});
    baseHull.setAttribute('position', {x:0, y:0, z:0.15 * 0.5});
    
    // create energy indicator
    let margin = 0.005; // 0.5cm
    let energyIndicator = document.createElement('a-entity');
    this.energyIndicator = energyIndicator;
    this.energyIndicatorDimensions = {
      width: this.hullDimensions.width - margin,
      height: this.hullDimensions.height - margin,
      depth: this.hullDimensions.depth - margin
    };
    
    energyIndicator.setAttribute('geometry', Object.assign({primitive: 'box'}, this.energyIndicatorDimensions));
    energyIndicator.setAttribute('position', {x:0, y:0, z:0});
    energyIndicator.setAttribute('material', {color: 'rgb(14, 128, 159)', transparent: false});

    this.energyText = document.createElement('a-entity');
        
    this.energyText.setAttribute('text', {
      value: `Energy: ${this.data.energy}`,
      width: this.energyIndicatorDimensions.depth
    });
    this.energyText.setAttribute('rotation', 'y', -90);
    this.energyText.setAttribute('position', {
      x: -this.hullDimensions.width / 2,
      y: 0,
      z: 0.005 + ((this.energyIndicatorDimensions.depth / 2) - this.energyIndicatorDimensions.depth/8)
    });
    energyIndicator.appendChild(this.energyText);
    baseHull.appendChild(energyIndicator);
    this.el.appendChild(baseHull);
    
    // create trigger
    let trigger = document.createElement('a-box');
    this.trigger = trigger;
    trigger.id = 'trigger';
    trigger.setAttribute('width', 0.02);
    trigger.setAttribute('height', 0.02);
    trigger.setAttribute('depth', 0.015);
    trigger.setAttribute('material', {color: 'rgb(14, 128, 159)'});
    trigger.setAttribute('position', {x:0.02, y:0, z:0.05});
    trigger.setAttribute('rotation', {x:0, y:-5, z:0});
    this.el.appendChild(trigger);
    
    
  },
  
  init: function () {
    console.log('init magicLight');
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.system = this.sceneEl.systems['game-state'];
    this.createModel();
    
    this.triggerPressed = false;
    this.triggerTime = -1;
    
    // this.el.addEventListener('raycaster-intersection', function (e) {
    //   //console.log(e);
    //   if(e.detail.intersections[0].object.el.id === 'lostStone') {
    //     console.log('still hovering lostStone');
    //
    //   }
    // });
    this.el.addEventListener('mousedown', (e) => {
      say('mousedown on lost stone');
    });
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
      trigger.setAttribute('rotation', {x:0, y:-30, z:0});
      this.triggerTime = this.gameState.time;
      
    });
    this.el.addEventListener('buttonup', () => {
      this.triggerPressed = false;
      trigger.setAttribute('rotation', {x:0, y:-5, z:0});
      this.triggerTime = -1;
    });
    
    this.el.addEventListener('click', (e) => {
      console.log(e.detail.intersectedEl.id);
    });
    
    
    
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
    
    
    
  },
  
  update: function (oldData) {

    if(oldData.energy === this.data.energy) return;
    this.data.energy = Math.max(this.data.energy, 0);

    const energy = this.data.energy;
    const relEnergy = energy / this.data.maxEnergy;
    this.energyIndicator.setAttribute('geometry', 'depth',
      this.energyIndicatorDimensions.depth * (energy / this.data.maxEnergy)
    );
    this.textTemplate = energy <= 2000 ? `${energy}` : `Energy: ${energy}`;
    this.energyIndicator.setAttribute('position', {
      x: 0,
      y: 0,
      z: -this.energyIndicatorDimensions.depth/2 * (this.data.maxEnergy - energy) / this.data.maxEnergy
    });
    
    this.energyIndicator.setAttribute('material', {color: `hsl(${relEnergy * 130}, 41%, 58%)`});
    this.energyText.setAttribute('text', {value: this.textTemplate});
  }
    
    
  
});
