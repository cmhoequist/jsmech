RFEnemy = function(game, x, y, texture, circle){
  this.cx = circle.x;
  this.cy = circle.y;
  this.r = circle.radius;
  this.referenceAngle = Math.random()*(2*Math.PI);
  Phaser.Sprite.call(this, game, x, y, texture);
  this.speed = (0-Math.round(Math.random()))*Math.random() * (2 - 0.5) + 0.5;
  game.add.existing(this);

  this.increment = function(game){
    this.referenceAngle += game.time.physicsElapsed * this.speed;
    this.referenceAngle = this.referenceAngle % (2*Math.PI); //don't want indefinitely increasing angle
    this.x = this.cx + Math.cos(this.referenceAngle) * this.r;
    this.y = this.cy + Math.sin(this.referenceAngle) * this.r;
    var deg = this.referenceAngle/(Math.PI)*180;
    this.angle = deg;
  }
};

RFEnemy.prototype = Object.create(Phaser.Sprite.prototype);
RFEnemy.prototype.constructor = RFEnemy;
