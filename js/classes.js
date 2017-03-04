RFEnemy = function(game, x, y, texture, circle){
  //Inheritance
  VirtualPhysicsObject.call(this, game, x, y, texture);

  //Rangefinder (HUD) positioning
  this.cx = circle.x;
  this.cy = circle.y;
  this.r = circle.radius;
  this.referenceAngle = Math.random()*(2*Math.PI);  //angle relative to the player-mech: starting position is random
  this.angle = 0;

  //Informational text
  this.style = { font: '12px courier', fill: '#ffffff'};
  this.text = game.add.text(x,y, '', this.style);
  this.text.x = this.width/2 - this.text.width/2;
  this.text.y += this.height/2;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;

  //Firing missiles
  this.startTime = new Date().getTime();
  this.timeElapsed = 0;
  this.reloadDelay = 2000;

  //Missile spawning function
  this.fire = function(hud){
    var currentTime = new Date().getTime();
    this.timeElapsed = currentTime - this.startTime;
    if(this.timeElapsed > this.reloadDelay){
      this.startTime = currentTime;
      hud.spawnBlip(this.referenceAngle);
    }
  }

  //Virtual tracking update function. TODO: simple pursuit ai
  this.updateDistance = function(mechCx, mechCy){
    //Calculate and display virtual distance.
    var xdif = this.virtualPos.x - mechCx;
    var ydif = this.virtualPos.y - mechCy;
    var distance = Math.sqrt(xdif*xdif + ydif*ydif);
    this.text.setText(Math.floor(distance).toString());
    //Color code enemy ranges. (Blue should be beyond effective distance of your [or their?] weapons).
    var pct = distance > 8000 ? -1 : distance/8000;
    var c = pct < 0 ? 0x0000ff : Phaser.Color.interpolateColor(0xff0000, 0x00ff00, 8000, 8000*pct, 1);
    this.tint = c;
    //Recalculate enemy position on rangefinder: angle can be found from distance components
    this.referenceAngle = Math.atan2(ydif, xdif); // range (-PI, PI]
    if(this.referenceAngle < 0){
      this.referenceAngle += 2*Math.PI; // range [0, 2PI]
    }
  }
  //HUD position update function
  this.increment = function(game, mech, hud){
    this.updateDistance(mech.virtualPos.x, mech.virtualPos.y); //must be called first to correctly update reference angle
    this.x = this.cx + Math.cos(this.referenceAngle) * this.r;
    this.y = this.cy + Math.sin(this.referenceAngle) * this.r;
    var deg = this.referenceAngle/(Math.PI)*180;
    this.angle = deg;
    this.text.x = Phaser.Math.linearInterpolation([this.cx, this.x], 0.8);
    this.text.y = Phaser.Math.linearInterpolation([this.cy, this.y], 0.8);
    this.fire(hud);
  }
};

RFEnemy.prototype = Object.create(VirtualPhysicsObject.prototype);
RFEnemy.prototype.constructor = RFEnemy;
