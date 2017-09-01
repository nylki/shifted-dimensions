export {magicLight};

let magicLight = AFRAME.registerComponent('magic-light', {
  init: function () {
    this.sceneEl = document.querySelector('a-scene');
    this.gameState = this.system = this.sceneEl.systems['game-state'];
    
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
    
    this.el.addEventListener('click', (e) => {
      console.log('click');
      console.log(e.detail.intersectedEl.id);
    });
  }
});
