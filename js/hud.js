 var blips, radarMech, rangefinderMech, cursors, rfEnemies, enemyMechs;
var radarComponent, radarRadius;
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
    // blips.enableBody = true;
    rfEnemies = game.add.group();
    rfEnemies.enableBody = true;
    maskedLayer = game.add.group();
    enemyMechs = game.add.group();
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);

    //Create arc boundaries for HUD components
    radarComponent = new Phaser.Circle(cx, cy, game.height/2);
    radarRadius = radarComponent.diameter/2;
    graphics.drawCircle(radarComponent.x, radarComponent.y, radarComponent.diameter);
    var r2 = radarRadius+25;
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
    radarMech = game.add.sprite(cx, cy,'mech');
    radarMech.x -= radarMech.width/2;
    radarMech.y -= radarMech.height/2;
    game.physics.arcade.enable(radarMech);
    radarMech.body.immovable = true;
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
    // game.physics.arcade.overlap(radarMech,blips,this.radarCollisions,null,this);
    //Kill radar blips that go out of bounds and replace with new blip
    for(var i = 0; i < blips.children.length; i++){

      var currentBlip = blips.children[i];
      currentBlip.move();
      // var dx = currentBlip.x - radarComponent.x;
      // var dy = currentBlip.y - radarComponent.y;
      // var dist = dx*dx + dy*dy;
      // var fatDist = (dx+currentBlip.width)*(dx+currentBlip.width) + (dy+currentBlip.height)*(dy+currentBlip.height);
      // if( dist >= radarRadius*radarRadius){
      //   currentBlip.kill();
      // }
    }

    //Handle user input
    userInput();

    // Update rangefinder
    for(var i = 0; i < rfEnemies.children.length; i++){
      rfEnemies.children[i].increment(game, rangefinderMech, this);
    }
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
  render : function(){
    game.debug.spriteInfo(radarMech, 32, 32);
  }
}

function userInput(){
  if(cursors.left.isDown){
    rangefinderMech.updateAcc(-rangefinderMech.virtualEngineAcc, 0);
  }
  else if(cursors.right.isDown){
    rangefinderMech.updateAcc(rangefinderMech.virtualEngineAcc, 0);
  }
  if(cursors.up.isDown){ //should be able to move on two axes simultaneously
    rangefinderMech.updateAcc(0, -rangefinderMech.virtualEngineAcc);
  }
  else if(cursors.down.isDown){
    rangefinderMech.updateAcc(0, rangefinderMech.virtualEngineAcc);
  }
}
