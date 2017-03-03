RFEnemy = function(game, x, y, texture, circle){
  this.cx = circle.x;
  this.cy = circle.y;
  this.r = circle.radius;
  this.referenceAngle = Math.random()*(2*Math.PI);
  Phaser.Sprite.call(this, game, x, y, texture);
  this.speed = (0-Math.round(Math.random()))*Math.random() * (2 - 0.5) + 0.5;
  game.add.existing(this);

  this.enemyX = game.world.randomX;
  this.enemyY = game.world.randomY;
  this.distance;
  this.style = { font: '12px courier', fill: '#ffffff'};
  this.text = game.add.text(x,y, '', this.style);
  this.text.x = this.width/2 - this.text.width/2;
  this.text.y += this.height/2;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;

  this.updateDistance = function(mechCx, mechCy){
      var xdif = this.enemyX - mechCx;
      var ydif = this.enemyY - mechCy;
      this.distance = Math.sqrt(xdif*xdif + ydif*ydif);
      this.text.setText(Math.floor(this.distance).toString());
  }

  this.increment = function(game, mech){
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
    this.updateDistance(mech.x, mech.y);
  }
};

RFEnemy.prototype = Object.create(Phaser.Sprite.prototype);
RFEnemy.prototype.constructor = RFEnemy;
