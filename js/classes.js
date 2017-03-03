RFEnemy = function(game, x, y, texture, circle){
  //Inheritance
  Phaser.Sprite.call(this, game, x, y, texture);
  game.add.existing(this);

  //HUD positioning
  this.cx = circle.x;
  this.cy = circle.y;
  this.r = circle.radius;
  this.referenceAngle = Math.random()*(2*Math.PI);
  this.speed = (0-Math.round(Math.random()))*Math.random() * (2 - 0.5) + 0.5;

  //Logical tracking
  this.enemyX = game.world.randomX;
  this.enemyY = game.world.randomY;
  this.distance;
  this.style = { font: '12px courier', fill: '#ffffff'};
  this.text = game.add.text(x,y, '', this.style);
  this.text.x = this.width/2 - this.text.width/2;
  this.text.y += this.height/2;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.mechcx = 0;
  this.mechcy = 0;

  //Tracking display update function
  this.updateDistance = function(mechCx, mechCy){
    var xdif = this.enemyX - mechCx;
    var ydif = this.enemyY - mechCy;
    this.distance = Math.sqrt(xdif*xdif + ydif*ydif);
    this.text.setText(Math.floor(this.distance).toString());

    var pct = this.distance > 8000 ? -1 : this.distance/8000;
    var c = pct < 0 ? 0x0000ff : Phaser.Color.interpolateColor(0xff0000, 0x00ff00, 8000, 8000*pct, 1);
    this.tint = c;
  }
  //HUD position update function
  this.increment = function(game, mech){
/*TODO; implement enemy AI. Markers are just wandering around in circles as proof of concept.*/
    this.referenceAngle += game.time.physicsElapsed * this.speed;
    this.referenceAngle = this.referenceAngle % (2*Math.PI); //don't want indefinitely increasing angle
    this.x = this.cx + Math.cos(this.referenceAngle) * this.r;
    this.y = this.cy + Math.sin(this.referenceAngle) * this.r;
    var deg = this.referenceAngle/(Math.PI)*180;
    this.angle = deg;
    var xarr = [mech.x, this.x];
    var yarr = [mech.y, this.y];
    this.text.x = Phaser.Math.linearInterpolation(xarr, 0.8);
    this.text.y = Phaser.Math.linearInterpolation(yarr, 0.8);
    this.mechcx = mech.logicalx;
    this.mechcy = mech.logicaly;
    this.updateDistance(mech.logicalx, mech.logicaly);
  }
};

RFEnemy.prototype = Object.create(Phaser.Sprite.prototype);
RFEnemy.prototype.constructor = RFEnemy;

PlayerMech = function(game, x, y, texture){
  this.logicalx = x;
  this.logicaly = y;
  this.accPerTick = 1;
  this.vx = 0;
  this.vy = 0;

  Phaser.Sprite.call(this, game, x, y, texture);
  game.add.existing(this);

  this.anchor.x = 0.5;
  this.anchor.y = 0.5;

  this.logicalMove = function(ax, ay){
    this.vx += ax;
    this.vy += ay;
    this.logicalx += this.vx;
    this.logicaly += this.vy;
  }
}

PlayerMech.prototype = Object.create(Phaser.Sprite.prototype);
PlayerMech.prototype.constructor = PlayerMech;
