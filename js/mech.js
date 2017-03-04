var game = new Phaser.Game('100','100', Phaser.AUTO, '', null, false, false);
//Recall: p1 & p2 are width and height. Given as strings, they are a percentage value of the browser window.
//p3: preferred rendering context
//p4: parent element in the DOM: body if none given
//p5: state object. This and all following parameters are optional.
//p6: transparent background
//p7: anti-aliasing (smooths textures: bad for pixel art)
var boot = {
  preload : function(){
  },
  create : function(){
    game.state.start('hud');
  }
}

//Game states are like levels: each represents a phase of the game. Recall that PRELOAD, CREATE, UPDATE, and RENDER are the four core functions of each state.
game.state.add('Boot',boot);
game.state.add('hud', hud);
// // game.state.add('Combat');
// // game.state.add('Docking');
game.state.add('Gameover',gameover);
//
// //Initialize a state
game.state.start('Boot');
