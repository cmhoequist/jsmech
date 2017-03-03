var hud, blips, radarMech, cursors;
var circle, radius;

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
    radius = circle.diameter/2;
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);
    graphics.drawCircle(circle.x, circle.y, circle.diameter);

    radarMech = game.add.sprite(game.world.centerX,game.world.centerY,'mech');
    radarMech.x -= radarMech.width/2;
    radarMech.y -= radarMech.height/2;
    game.physics.arcade.enable(radarMech);
    radarMech.body.immovable = true;

    //Create radar blips
    blips = game.add.group();
    blips.enableBody = true;
    for(var i = 0; i < 3; i++){
      this.spawnBlip();
    }

    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function(){
    game.physics.arcade.overlap(radarMech,blips,this.radarCollisions,null,this);

    var hitList = [];
    for(var i = 0; i < blips.children.length; i++){
        var dx = blips.children[i].x - circle.x;
        var dy = blips.children[i].y - circle.y;
        var dist = dx*dx + dy*dy;
        if(dist >= radius*radius){
          hitList.push(i);
        }
    }
    while(hitList.length > 0){
    //   blips.remove(blips.children[hitList.pop()]);
      blips.children[hitList.pop()].kill();
      this.spawnBlip();
    }

    if(cursors.left.isDown){
      blips.forEach(function(dot){
        dot.body.velocity.x += 1;
      });
    }
    else if(cursors.right.isDown){
      blips.forEach(function(dot){
        dot.body.velocity.x -= 1;
      });
    }
    else if(cursors.up.isDown){
      blips.forEach(function(dot){
        dot.body.velocity.y += 1;
      });
    }
    else if(cursors.down.isDown){
      blips.forEach(function(dot){
        dot.body.velocity.y -= 1;
      });
    }

  },
  radarCollisions : function(mech, blip){
    blip.kill();
    this.spawnBlip();
  },
  spawnBlip : function(){
    var blip = blips.getFirstExists(false);
    var angle = Math.random()*Math.PI*2;
    var x = game.world.centerX+Math.cos(angle)*circle.diameter/2;
    var y = game.world.centerY+Math.sin(angle)*circle.diameter/2;
    var dx = x-game.world.centerX;
    var dy = y-game.world.centerY;
    var speedFudge = Math.random()*(0.75 - 0.35)+0.35;

    if(blips.children.length < 3){
      var gfx = game.add.graphics();
      gfx.lineStyle(1, 0xff0000, 1);
      gfx.drawCircle(0,0,5); //positioned relative to sprite
      var sprite = blips.create(x,y,gfx.generateTexture());
      sprite.x -= sprite.width/2;
      sprite.y -= sprite.height/2;
      if(sprite.x < circle.x){
        sprite.x += sprite.width/2;
      }
      else if(sprite.x > circle.x){
        sprite.x -= sprite.width/2;
      }
      if(sprite.y < circle.y){
        sprite.y += sprite.height/2;
      }
      else if(sprite.y > circle.y){
        sprite.y -= sprite.height/2;
      }
      gfx.destroy();
      sprite.body.velocity.x = -speedFudge*dx;
      sprite.body.velocity.y = -speedFudge*dy;
    }
    else{
      blip.body.velocity.x = -speedFudge*dx;
      blip.body.velocity.y = -speedFudge*dy;
      blip.x = x;
      blip.y = y;
      blip.revive();
    }
  },
  render : function(){
    game.debug.spriteInfo(radarMech, 32, 32);
  }
}
