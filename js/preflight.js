var hud, blip, blips, radarMech, cursors;

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
    blips = game.add.group();
    for(var i = 0; i < 3; i++){
      var randx = (hud.x + hud. Math.random() * (hud.x+hud.width - hud.x) + hud.x;
      var randy = Math.sqrt(hud.width*hud.width/4-randx*randx);
      blip = blips.create(randx,hud.x+hud.height/2 + randy,'blip');
      // var dx = blip.x - radarMech.x + radarMech.width/2;
      // var dy = blip.y - radarMech.y + radarMech.height/2;
      // blip.body.velocity.x = dx*dy/dx;
      // blip.body.velocity.y = dy*dx/dy;
    }
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
    this.checkRadarBounds();
    if (cursors.right.isDown){
      blip.body.acceleration.x += -2;
    }
    else if (cursors.left.isDown){
      blip.body.acceleration.x += 2;
    }
    else if(cursors.up.isDown){
      blip.body.acceleration.y += 2;
    }
    else if(cursors.down.isDown){{
      blip.body.acceleration.y -= 2;
    }}
  },
  checkRadarBounds(){
    var dx = (blip.x + blip.width/2) - (hud.x + hud.width/2);
    var dy = (blip.y + blip.height/2) - (hud.y + hud.height/2);
    var radius = hud.height/2;
    var distance = Math.sqrt(dx*dx+dy*dy);
    if(distance+blip.width >= radius){
      blip.kill();
    }
  }
}
