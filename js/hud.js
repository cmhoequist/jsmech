//Virtual entities
var playerMech, enemyMechs, missiles;

//HUD entities
var rangefinderMech, radarMech, rangefinderEnemies;
var radarRadius, rangefinderRadius;
var centerX, centerY;
var maskedLayer;
var graphics;

//input
var cursors;

var hud = {
  preload : function(){
    game.load.image('blip','assets/radarBlip.png');
    game.load.image('mech','assets/radarCenter.png');
  },
  create : function(){
    //Housekeeping
    missiles = game.add.group();
    rangefinderEnemies = game.add.group();
    rangefinderEnemies.enableBody = true;
    maskedLayer = game.add.group();
    enemyMechs = game.add.group();
    graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);
    centerX = game.world.centerX;
    centerY = game.world.centerY;

    //Create arc boundaries for HUD components
    graphics.drawCircle(centerX, centerY, game.height/2);
    radarRadius = game.height/4;
    var r2 = radarRadius+25;
    var offset = 10;
    var radx = [Phaser.Math.degToRad(offset), Phaser.Math.degToRad(180-offset), Phaser.Math.degToRad(180+offset), Phaser.Math.degToRad(360-offset)];
    var rady = [Phaser.Math.degToRad(90-offset), Phaser.Math.degToRad(90+offset), Phaser.Math.degToRad(270-offset), Phaser.Math.degToRad(270+offset)]
    graphics.arc(centerX, centerY, r2, radx[0], rady[0], false);     //origin x, origin y, arc radius, start angle (rad), end angle (rad), draw counterclockwise bool
    graphics.arc(centerX, centerY, r2, rady[1], radx[1], false);
    graphics.arc(centerX, centerY, r2, radx[2], rady[2], false);
    graphics.arc(centerX, centerY, r2, rady[3], radx[3], false);
    //Draw line boundaries for HUD components
    for(var i = 0; i < radx.length; i++){
      var x = centerX+Math.cos(radx[i])*r2;
      var y = centerY+Math.sin(radx[i])*r2;
      graphics.moveTo(x,y);
      graphics.lineTo(x < centerX ? 20 : game.world.width-20, y); //lines running orthogonal to world bounds (horizontal)
      graphics.lineTo(x < centerX ? 20 : game.world.width-20, y < centerY ? 20 : game.world.height - 20); //lines running parallel to world bounds (vertical)
    }
    for(var i = 0; i < rady.length; i++){
      var x = centerX+Math.cos(rady[i])*r2;
      var y = centerY+Math.sin(rady[i])*r2;
      graphics.moveTo(x, y);
      graphics.lineTo(x, y < centerY ? 20 : game.world.height - 20);  //lines running orthogonal to world bounds (vertical)
      graphics.lineTo(x < centerX ? 20 : game.world.width-20, y < centerY ? 20 : game.world.height - 20); //lines running parallel to world bounds (horizontal)
    }

    //Create radar HUD component
    radarMech = game.add.sprite(centerX, centerY,'mech');
    radarMech.anchor.setTo(0.5,0.5);
    game.physics.arcade.enable(radarMech);
    radarMech.body.immovable = true;
    //Create radar missiles
    maskedLayer.add(missiles);
    //Mask radar missiles (lets us cut corners on pixel-perfect radar bounds collision detection)
    var mask = game.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    mask.drawCircle(centerX, centerY, radarRadius*2);
    mask.endFill();
    maskedLayer.mask = mask;

    //Create rangefinder HUD component
    var x0 = centerX+Math.cos(radx[3])*r2;
    var x1 = game.world.width-20;
    var y0 = centerY+Math.sin(radx[3])*r2;
    var y1 = 20;
    var rangefinderx = (x0+x1)/2; //math to find rfx, rfy, and rfr just a matter of aesthetic preference
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
    //Kill radar missiles that overlap with the figure in the center (mech)
    // game.physics.arcade.overlap(radarMech,missiles,this.radarCollisions,null,this);
    //Kill radar missiles that go out of bounds and replace with new blip
    for(var i = 0; i < missiles.children.length; i++){
      var currentBlip = missiles.children[i];
      currentBlip.move();
    }

    //Handle user input
    userInput();

    // Update rangefinder
    for(var i = 0; i < rangefinderEnemies.children.length; i++){
      rangefinderEnemies.children[i].increment(game, rangefinderMech, this);
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
    // var sprite = rangefinderEnemies.create(x,y,graphics.generateTexture());
    var circle = {x: rfx, y: rfy, radius: r};
    rangefinderEnemies.add(new RFEnemy(game, x, y, graphics.generateTexture(), circle));
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
