var hud, blip, blips, radarMech, cursors;

var circle;

var preflight = {
  //Member functions declared here
  preload : function(){
    //Note that radar coloring is #14a10c
    game.load.image('blip','assets/radarBlip.png');
    game.load.image('mech','assets/radarCenter.png');
  },
  create : function(){
    //Create HUD elements
    circle = new Phaser.Circle(game.world.centerX,game.world.centerY,300);
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);
    graphics.drawCircle(circle.x, circle.y, circle.diameter);

    radarMech = game.add.sprite(game.world.centerX,game.world.centerY,'mech');
    radarMech.x -= radarMech.width/2;
    radarMech.y -= radarMech.height/2;

    //Create radar blips
    blips = game.add.group();
    blips.enableBody = true;
    for(var i = 0; i < 3; i++){
      var angle = Math.random()*Math.PI*2;
      var x = game.world.centerX+Math.cos(angle)*circle.diameter/2;
      var y = game.world.centerY+Math.sin(angle)*circle.diameter/2;
      var sprite = blips.create(x,y);
      var gfx = game.add.graphics();
      gfx.lineStyle(1, 0x00ff00, 1);
      gfx.drawCircle(0,0,5); //positioned relative to sprite
      sprite.addChild(gfx);

      var dx = x-game.world.centerX;
      var dy = y-game.world.centerY;
      sprite.body.velocity.x = -0.5*dx;
      sprite.body.velocity.y = -0.5*dy;
    }
  },
  update: function(){

  }
}
