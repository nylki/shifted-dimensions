export {energyIndicator};

let energyIndicator = AFRAME.registerComponent('energy-indicator', {
  schema: {
    value: {type: 'number', default: 10000},
    max: {type: 'number', default: 10000},
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 0.1},
    
  },
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.system = this.sceneEl.systems['game-state'];
    console.log(this.el);
    this.energyBar = document.createElement('a-entity');
    this.energyText = document.createElement('a-entity');
    this.el.appendChild(this.energyBar);
    this.el.appendChild(this.energyText);
    
    this.energyBar.setAttribute('geometry', {
      primitive: 'plane',
      width: this.data.width,
      height: this.data.height
    });
    
    this.energyText.setAttribute('text', {
      value: `Energy: ${this.data.value}`,
      width: this.data.width
    });
    this.energyText.setAttribute('position', {
      x: (this.data.width / 2) - this.data.width/8
    });
    
  },
  update: function (oldData) {
    
    if(oldData.value === this.data.value) return;
    this.data.value = Math.max(this.data.value, 0);
    // console.log(this.data.value);
    const energy = this.data.value;
    const relEnergy = energy / this.data.max;
    // console.log(energy);
    this.energyBar.setAttribute('geometry', {
      width: this.data.width * (energy / this.data.max)
    });
    this.textTemplate = energy <= 200 ? `${energy}` : `Energy: ${energy}`;
    // this.energyBar.setAttribute('position', {
    //   x: -this.data.width/2 * (this.data.max - energy) / this.data.max
    // });
    
    this.energyBar.setAttribute('material', {color: `hsl(${relEnergy * 130}, 41%, 58%)`});
    this.energyText.setAttribute('text', {value: this.textTemplate});
  }
});
