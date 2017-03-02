var game = new Phaser.Game('100', '100', Phaser.AUTO, '');
//Recall: p1 & p2 are width and height. Given as strings, they are a percentage value of the browser window.
//p3: preferred rendering context
//p4: parent element in the DOM: body if none given
//p5: state object. This and all following parameters are optional.
var boot = {
  preload : function(){
  },
  init: function(){
    // scale the game 4x
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setUserScale(4, 4);
    // enable crisp rendering
    game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas)
  },
  create : function(){
    game.state.start('Preflight');
  }
}

//Game states are like levels: each represents a phase of the game. Recall that PRELOAD, CREATE, UPDATE, and RENDER are the four core functions of each state.
game.state.add('Boot',boot);
game.state.add('Preflight', preflight);
// // game.state.add('Combat');
// // game.state.add('Docking');
// // game.state.add('Gameover');
//
// //Initialize a state
game.state.start('Boot');
