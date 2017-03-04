var gameover = {
  preload : function(){
  },
  create : function(){
    var style = { font: '18px courier', fill: '#ffffff'};
    var text = game.add.text(game.world.centerX, game.world.centerY, "Game Over.\nCause of Death: Missile Impact", style);
    text.anchor.setTo(0.5,0.5);
  },
  update : function(){

  },
  render : function(){

  }
}
