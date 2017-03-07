//Virtual entities
var virtualPlayerMech, virtualEnemyMechs = [], virtualMissiles = []; //Note that groups only contain DISPLAY entities, so these will be lists.

//HUD entities
var rangefinderMech, radarMech, enemyMechs, missiles;
var radarRadius, rangefinderRadius, rangefinder, radar;
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
    centerX = game.world.centerX;
    centerY = game.world.centerY;
    enemyMechs = game.add.group();
    missiles = game.add.group();

    maskedLayer = game.add.group();
    graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x00ff00, 1);


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
    radar = {x: centerX, y: centerY, r: game.height/2};
    radarMech = game.add.sprite(centerX, centerY,'mech');
    radarMech.anchor.setTo(0.5,0.5);
    game.physics.arcade.enable(radarMech);
    radarMech.body.immovable = true;
    //Mask radar missiles (lets us cut corners on pixel-perfect radar bounds collision detection)
    maskedLayer.add(missiles);
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
    rangefinder = {x: rangefinderx, y: rangefindery, r: rangefinderradius};
    graphics.drawCircle(rangefinderx, rangefindery, rangefinderradius*2);
    rangefinderMech = game.add.sprite(rangefinderx, rangefindery, 'mech');

    //Create compass
    var compassGap = 15;
    var y1 = centerY + Math.sin(rady[3])*r2;
    var y0 = 20;
    var compassr = (y1 - y0)/2;
    var compassy = rangefinder.y - rangefinder.r + compassr;
    var crTheta = Math.asin((rangefinder.y - compassy)/(rangefinder.r + compassr + compassGap)); //on the range -pi/2 to pi/2
    if(crTheta < 0){
      crTheta += 2*Math.PI; // range [0, 2PI]
    }
    var compassxdif = Math.cos(crTheta)*(rangefinder.r + compassr + compassGap);
    var compassx = rangefinder.x - compassxdif;
    graphics.drawCircle(compassx, compassy, compassr*2);
    //These may look off center to you, but trust me, they are not - a vertical line through the compass will exactly bisect them
    var text = game.add.text(compassx, compassy - compassr,  'N', { font: '14px Inconsolata', fill: '#ffffff'});
    text.anchor.setTo(0.5, 0.5);
    text.y += text.height;
    text = game.add.text(text.x, text.y, '0°', { font: '12px Inconsolata', fill: '#ffffff'});
    text.anchor.setTo(0.5, 0.5);
    text.y += text.height*0.6;
    graphics.drawCircle(compassx, compassy, 10);
    graphics.moveTo(compassx, compassy - compassr);
    graphics.lineTo(compassx, compassy + compassr);

    //Create player
    virtualPlayerMech = new VirtualPlayerMech(centerX, centerY);

    //Create enemies
    for(var i = 0; i < 3; i++){
        spawnEnemyMech();
    }

    //Arrow key inputs
    cursors = game.input.keyboard.createCursorKeys();
  },
  radarCollisions : function(mech, blip){
    blip.kill();
    // game.state.start('Gameover', true, false);
    //p1: state to start
    //p2: clearWorld: default is true, clears World display list (not Stage display list)
    //p3: clearCache: default is false, clears all loaded assets
  },
  update: function(){
    //Kill radar missiles that overlap with the figure in the center (mech)
    // game.physics.arcade.overlap(radarMech,missiles,this.radarCollisions,null,this);
    //Kill radar missiles that go out of bounds and replace with new blip
    for(var i = 0; i < missiles.children.length; i++){
      var currentBlip = missiles.children[i];
      currentBlip.move();
    }

    //Handle user input (updates player mech)
    userInput();

    //Update virtual enemy mechs
    for(var i = 0; i < virtualEnemyMechs.length; i++){
      virtualEnemyMechs[i].updateBehavior(virtualPlayerMech.virtualPos);
    }
  },
  render : function(){
    game.debug.spriteInfo(radarMech, 32, 32);
  }

}

function userInput(){
  var x = 0, y = 0;
  if(cursors.left.isDown){
    console.log
    x = -1;
  }
  else if(cursors.right.isDown){
    x = 1;
  }
  if(cursors.up.isDown){ //should be able to move on two axes simultaneously
    y = -1;
  }
  else if(cursors.down.isDown){
   y = 1;
  }
  var theta = Math.atan2(y, x); // range (-PI, PI]
  if(theta < 0){
    theta += 2*Math.PI; // range [0, 2PI]
  }
  if(!(x === 0 && y === 0)){
    virtualPlayerMech.directedMove(theta);
  }
}

function spawnEnemyMech(){
  var vMech = new VirtualEnemyMech(game.world.randomX, game.world.randomY);
}
