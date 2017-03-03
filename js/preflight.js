var hud, blips, radarMech, cursors;
var circle, radius;
var cx, cy;
var preflight = {
  //Member functions declared here
  preload : function(){
    //Note that radar coloring is #14a10c
    game.load.image('blip','assets/radarBlip.png');
    game.load.image('mech','assets/radarCenter.png');
  },
  create : function(){
    cx = game.world.centerX;
    cy = game.world.centerY;

    //Create radar HUD component
    circle = new Phaser.Circle(cx, cy,300);
    radius = circle.diameter/2;
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);
    graphics.drawCircle(circle.x, circle.y, circle.diameter);
    radarMech = game.add.sprite(cx, cy,'mech');
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

    //Create arc boundaries for remaining HUD components
    var r2 = circle.diameter/2+25;
    var offset = 10;
    var radx = [Phaser.Math.degToRad(offset), Phaser.Math.degToRad(180-offset), Phaser.Math.degToRad(180+offset), Phaser.Math.degToRad(360-offset)];
    var rady = [Phaser.Math.degToRad(90-offset), Phaser.Math.degToRad(90+offset), Phaser.Math.degToRad(270-offset), Phaser.Math.degToRad(270+offset)]
    graphics.arc(cx, cy, r2, radx[0], rady[0], false);     //origin x, origin y, arc radius, start angle (rad), end angle (rad), draw counterclockwise bool
    graphics.arc(cx, cy, r2, rady[1], radx[1], false);
    graphics.arc(cx, cy, r2, radx[2], rady[2], false);
    graphics.arc(cx, cy, r2, rady[3], radx[3], false);
    //Draw line boundaries for remaining HUD components
    for(var i = 0; i < radx.length; i++){
      var x = cx+Math.cos(radx[i])*r2;
      var y = cy+Math.sin(radx[i])*r2;
      graphics.moveTo(x,y);
      graphics.lineTo(x < cx ? 20 : game.world.width-20, y); //lines running orthogonal to world bounds (horizontal)
      graphics.lineTo(x < cx ? 20 : game.world.width-20, y < cy ? 20 : game.world.height - 20); //lines running parallel to world bounds (vertical)
    }
    for(var i = 0; i < rady.length; i++){
      var x = cx+Math.cos(rady[i])*r2;
      var y = cy+Math.sin(rady[i])*r2;
      graphics.moveTo(x, y);
      graphics.lineTo(x, y < cy ? 20 : game.world.height - 20);  //lines running orthogonal to world bounds (vertical)
      graphics.lineTo(x < cx ? 20 : game.world.width-20, y < cy ? 20 : game.world.height - 20); //lines running parallel to world bounds (horizontal)
    }

    //Arrow key inputs
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
    var x = cx+Math.cos(angle)*circle.diameter/2;
    var y = cy+Math.sin(angle)*circle.diameter/2;
    var dx = x-cx;
    var dy = y-cy;
    var speedFudge = Math.random()*(0.75 - 0.35)+0.35;
    var vx = -speedFudge*dx;
    var vy = -speedFudge*dy;
    var spd = Math.sqrt(vx*vx + vy*vy);

    if(blips.children.length < 3){
      //Draw radar blip
      var gfx = game.add.graphics();
      gfx.lineStyle(1, 0xff0000, 1);
      gfx.drawCircle(0,0,5); //positioned relative to sprite
      var sprite = blips.create(x,y,gfx.generateTexture());
      //Position speed text beneath radar blip
      var style = { font: '12px courier', fill: '#ffffff'};
      var text = game.add.text(0,0, Math.floor(spd).toString(), style);
      text.x = sprite.width/2 - text.width/2;
      text.y += sprite.height/2;
      sprite.addChild(text);
      gfx.destroy();
      //Adjust blip positioning around circumference of radar
      respectBounds(sprite);
      //Actualize blip speed
      sprite.body.velocity.x = vx;
      sprite.body.velocity.y = vy;
    }
    else if (blip !== null){
      blip.x = x;
      blip.y = y;
      respectBounds(blip);
      blip.body.velocity.x = vx;
      blip.body.velocity.y = vy;
      blip.revive();
      var tx = blip.children[0];
      tx.setText(Math.floor(spd).toString());
      tx.x = blip.width/2 - tx.width/2;
    }
  },
  render : function(){
    game.debug.spriteInfo(radarMech, 32, 32);
  }
}

function respectBounds(sprite){
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
}
