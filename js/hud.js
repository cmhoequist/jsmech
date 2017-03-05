var blips, playerMech, rangefinderMech, cursors, rfEnemies, enemyMechs;
var radarComponent, radius;
var cx, cy;
var maskedLayer;

var hud = {
  preload : function(){
    game.load.image('blip','assets/radarBlip.png');
    game.load.image('mech','assets/radarCenter.png');
  },
  create : function(){
    //Housekeeping
    cx = game.world.centerX;
    cy = game.world.centerY;
    blips = game.add.group();
    blips.enableBody = true;
    rfEnemies = game.add.group();
    rfEnemies.enableBody = true;
    maskedLayer = game.add.group();
    enemyMechs = game.add.group();
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);

    //Create arc boundaries for HUD components
    radarComponent = new Phaser.Circle(cx, cy, game.height/2);
    radius = radarComponent.diameter/2;
    graphics.drawCircle(radarComponent.x, radarComponent.y, radarComponent.diameter);
    var r2 = radius+25;
    var offset = 10;
    var radx = [Phaser.Math.degToRad(offset), Phaser.Math.degToRad(180-offset), Phaser.Math.degToRad(180+offset), Phaser.Math.degToRad(360-offset)];
    var rady = [Phaser.Math.degToRad(90-offset), Phaser.Math.degToRad(90+offset), Phaser.Math.degToRad(270-offset), Phaser.Math.degToRad(270+offset)]
    graphics.arc(cx, cy, r2, radx[0], rady[0], false);     //origin x, origin y, arc radius, start angle (rad), end angle (rad), draw counterclockwise bool
    graphics.arc(cx, cy, r2, rady[1], radx[1], false);
    graphics.arc(cx, cy, r2, radx[2], rady[2], false);
    graphics.arc(cx, cy, r2, rady[3], radx[3], false);
    //Draw line boundaries for HUD components
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

    //Create radar HUD component
    playerMech = game.add.sprite(cx, cy,'mech');
    playerMech.x -= playerMech.width/2;
    playerMech.y -= playerMech.height/2;
    game.physics.arcade.enable(playerMech);
    playerMech.body.immovable = true;
    //Create radar blips


    maskedLayer.add(blips);
    //Mask radar blips (lets us cut corners on pixel-perfect radar bounds collision detection)
    var mask = game.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    mask.drawCircle(radarComponent.x, radarComponent.y, radarComponent.diameter+1.5);
    mask.endFill();
    maskedLayer.mask = mask;

    //Create rangefinder HUD component
    var x0 = cx+Math.cos(radx[3])*r2;
    var x1 = game.world.width-20;
    var y0 = cy+Math.sin(radx[3])*r2;
    var y1 = 20;
    var rangefinderx = (x0+x1)/2;
    var rangefindery = (y0+y1)/2;
    var rangefinderradius = Math.min(0.8*(x1-x0),0.8*(y0-y1))/2;
    graphics.drawCircle(rangefinderx, rangefindery, rangefinderradius*2);
    rangefinderMech = new VirtualPhysicsObject(game, rangefinderx, rangefindery, 'mech');

    for(var i = 0; i < 3; i++){
        this.spawnRangefinderEnemy(rangefinderx, rangefindery, rangefinderradius);
    }

    //Arrow key inputs
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function(){
    //Kill radar blips that overlap with the figure in the center (mech)
    game.physics.arcade.overlap(playerMech,blips,this.radarCollisions,null,this);
    //Kill radar blips that go out of bounds and replace with new blip
    for(var i = 0; i < blips.children.length; i++){
      var currentBlip = blips.children[i];
      var dx = currentBlip.x - radarComponent.x;
      var dy = currentBlip.y - radarComponent.y;
      var dist = dx*dx + dy*dy;
      var fatDist = (dx+currentBlip.width)*(dx+currentBlip.width) + (dy+currentBlip.height)*(dy+currentBlip.height);
      if( dist >= radius*radius){
        currentBlip.kill();
      }
    }

    // Update rangefinder
    for(var i = 0; i < rfEnemies.children.length; i++){
      rfEnemies.children[i].increment(game, rangefinderMech, this);
    }

    //Handle user input
    userInput();
  },
  spawnRangefinderEnemy : function(rfx,rfy,r){
    var angle = 0;
    var x = rfx+Math.cos(angle)*r;
    var y = rfy+Math.sin(angle)*r;
    var h = 10;
    var graphics = game.add.graphics(x,y);
    graphics.lineStyle(4,0xffffff,1);
    graphics.lineTo(Math.cos(angle)*h,Math.sin(angle)*h);
    // var sprite = rfEnemies.create(x,y,graphics.generateTexture());
    var circle = {x: rfx, y: rfy, radius: r};
    rfEnemies.add(new RFEnemy(game, x, y, graphics.generateTexture(), circle));
    graphics.destroy();
  },
  radarCollisions : function(mech, blip){
    blip.kill();
    // game.state.start('Gameover', true, false);
    //p1: state to start
    //p2: clearWorld: default is true, clears World display list (not Stage display list)
    //p3: clearCache: default is false, clears all loaded assets
  },
  spawnBlip : function(spawnAngle){
    var missile = blips.getFirstExists(false);
    //Set position (determined by position of enemy relative to mech)
    var x = cx+Math.cos(spawnAngle)*radius;
    var y = cy+Math.sin(spawnAngle)*radius;
    //Set semirandom speed
    var dx = x-cx;
    var dy = y-cy;
    var speedFudge = Math.random()*(0.75 - 0.35)+0.35;
    var vx = -speedFudge*dx;
    var vy = -speedFudge*dy;
    var spd = Math.sqrt(vx*vx + vy*vy);

    if(missile === null){
      //Draw blip
      var gfx = game.add.graphics();
      gfx.lineStyle(1, 0xff0000, 1);
      gfx.drawCircle(0,0,5); //positioned relative to sprite
      missile = blips.create(x, y, gfx.generateTexture());
      gfx.destroy();
      //Position speed text beneath radar blip
      var style = { font: '12px courier', fill: '#ffffff'};
      var text = game.add.text(0,0, Math.floor(spd).toString(), style);
      text.x = missile.width/2 - text.width/2;
      text.y += missile.height/2;
      missile.addChild(text);
      //Adjust blip positioning around circumference of radar
      respectBounds(missile);
      //Actualize blip speed
      missile.body.velocity.x = vx;
      missile.body.velocity.y = vy;
    }
    else{
      missile.x = x;
      missile.y = y;
      respectBounds(missile);
      missile.body.velocity.x = vx;
      missile.body.velocity.y = vy;
      missile.revive();
      var tx = missile.children[0];
      tx.setText(Math.floor(spd).toString());
      tx.x = missile.width/2 - tx.width/2;
    }
  },
  render : function(){
    game.debug.spriteInfo(playerMech, 32, 32);
  }
}

function respectBounds(sprite){
  if(sprite.x < radarComponent.x){
    sprite.x += sprite.width/2;
  }
  else if(sprite.x > radarComponent.x){
    sprite.x -= sprite.width/2;
  }
  if(sprite.y < radarComponent.y){
    sprite.y += sprite.height/2;
  }
  else if(sprite.y > radarComponent.y){
    sprite.y -= sprite.height/2;
  }
}

function userInput(){
  if(cursors.left.isDown){
    rangefinderMech.updateAcc(-rangefinderMech.virtualEngineAcc, 0);
    blips.forEach(function(dot){
      dot.body.velocity.x += 1;
    });
  }
  else if(cursors.right.isDown){
    rangefinderMech.updateAcc(rangefinderMech.virtualEngineAcc, 0);
    blips.forEach(function(dot){
      dot.body.velocity.x -= 1;
    });
  }
  else if(cursors.up.isDown){
    rangefinderMech.updateAcc(0, -rangefinderMech.virtualEngineAcc);
    blips.forEach(function(dot){
      dot.body.velocity.y += 1;
    });
  }
  else if(cursors.down.isDown){
    rangefinderMech.updateAcc(0, rangefinderMech.virtualEngineAcc);
    blips.forEach(function(dot){
      dot.body.velocity.y -= 1;
    });
  }
}
