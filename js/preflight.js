var hud, blip, radarMech, cursors;

var preflight = {
  //Member functions declared here
  preload : function(){
    //Note that radar coloring is #14a10c
      game.load.image('background','assets/reticule5.png');
      game.load.image('blip','assets/radarBlip.png');
      game.load.image('mech','assets/radarCenter.png');
  },
  create : function(){
    //Create HUD elements, fix to camera
    hud = game.add.group();
    hud.fixedToCamera = true;
    var background = hud.create(0,0,'background');
    var w = background.width;
    var h = background.height;
    radarMech = hud.create(w/2,h/2,'mech');
    radarMech.x -= radarMech.width/2;
    radarMech.y -= radarMech.height/2;

    //Create radar blips
    blip = game.add.sprite(80,40, 'blip');
    game.physics.arcade.enable(blip);
    var dx = blip.x - radarMech.x + radarMech.width/2;
    var dy = blip.y - radarMech.y + radarMech.height/2;
    blip.body.velocity.x = dx*dy/dx;
    blip.body.velocity.y = dy*dx/dy;

    //Create cursors
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function(){
    if (cursors.right.isDown){
      blip.body.acceleration.x += -0.5;
    }
    else if (cursors.left.isDown){
      blip.body.acceleration.x += 0.5;
    }
  }
}
