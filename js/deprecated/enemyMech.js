RFEnemy = function(game, x, y, texture, circle){
  //Inheritance
  VirtualPhysicsObject.call(this, game, x, y, texture);

  //Rangefinder (HUD) positioning
  this.cx = circle.x;
  this.cy = circle.y;
  this.r = circle.radius;
  this.referenceAngle = Math.random()*(2*Math.PI);  //angle relative to the player-mech: starting position is random
  this.angle = 0;

  //Radar positioning
  this.mech = null;
  this.sgfx = game.add.graphics(centerX,centerY);
  this.sgfx.lineStyle(1,0xff0000,0.75);

  //Informational text
  this.style = { font: '12px courier', fill: '#ffffff'};
  this.text = game.add.text(x,y, '', this.style);
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.effectiveRange = 8000;
  this.defaultFontSize = 12;
  this.maxTextScale = 4;
  this.minTextScale = 1;

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
      //Spawn blip
      var missile = missiles.getFirstExists(false);
      //Set position (determined by position of enemy relative to mech)
      var x = this.mech === null ? centerX+Math.cos(this.referenceAngle)*radarRadius : this.mech.x;
      var y = this.mech === null ? centerY+Math.sin(this.referenceAngle)*radarRadius : this.mech.y;

      if(missile === null){
        //Draw blip
        var gfx = game.add.graphics(0, 0);
        gfx.lineStyle(1, 0xff0000, 1);
        gfx.drawCircle(0,0,5); //positioned relative to sprite
        missile = new Missile(game, x, y, gfx.generateTexture(), this.referenceAngle);
        missiles.add(missile);
        gfx.destroy();
        //Position speed text beneath radar blip
        var style = { font: '12px courier', fill: '#ffffff'};
        var text = game.add.text(0,0, Math.floor(missile.virtualMaxVel).toString(), style);
        text.x = missile.width/2 - text.width/2;
        text.y += missile.height/2;
        missile.addChild(text);
      }
      else{
        missile.virtualPos.x = missile.x = x;
        missile.virtualPos.y = missile.y = y;
        missile.direction = this.referenceAngle;
        missile.revive();
        var tx = missile.children[0];
        tx.setText(Math.floor(missile.virtualMaxVel).toString());
        tx.x = missile.width/2 - tx.width/2;
      }
    }
  }

  //Virtual tracking update function. TODO: simple pursuit ai
  this.updateDistance = function(mechCx, mechCy){
    //Calculate and display virtual distance.
    var xdif = this.virtualPos.x - mechCx;
    var ydif = this.virtualPos.y - mechCy;
    var distance = Math.sqrt(xdif*xdif + ydif*ydif);
    var dcap = distance > this.effectiveRange ? this.effectiveRange : distance;
    //y = c + ab^-dx: desired scaling is x2 to x1 size from distance ~0 to 500
    this.text.fontSize = this.defaultFontSize*(this.minTextScale + (this.maxTextScale - this.minTextScale)*Math.pow(2, -0.01*distance));
    this.text.setText(Math.floor(distance).toString());
    //Color code enemy ranges. (Blue should be beyond effective distance of your [or their?] weapons).
    var pct = distance > this.effectiveRange ? -1 : distance/this.effectiveRange;
    var c = pct < 0 ? 0x0000ff : Phaser.Color.interpolateColor(0xff0000, 0x00ff00, this.effectiveRange, this.effectiveRange*pct, 1); //start, end, numSteps, currentStep, alpha
    this.tint = c;
    //Recalculate enemy position on rangefinder: angle can be found from distance components
    this.referenceAngle = Math.atan2(ydif, xdif); // range (-PI, PI]
    if(this.referenceAngle < 0){
      this.referenceAngle += 2*Math.PI; // range [0, 2PI]
    }
    //Spawn enemies on short range radar if applicable
    if(distance < radarRadius){
      this.showShortRange(distance);
    }
    else if(this.mech !== null && this.mech.alive){
      this.mech.kill();
      this.sgfx.clear();  //clears linestyle, among other things, which we do not want to lose
      this.sgfx.lineStyle(1,0xff0000,1);
    }
  }
  //HUD position update function
  this.increment = function(game, mech, hud){
    this.moveToward(mech.virtualPos.x, mech.virtualPos.y);
    this.updateDistance(mech.virtualPos.x, mech.virtualPos.y); //must be called first to correctly update reference angle
    this.x = this.cx + Math.cos(this.referenceAngle) * this.r;
    this.y = this.cy + Math.sin(this.referenceAngle) * this.r;
    var deg = this.referenceAngle/(Math.PI)*180;
    this.angle = deg;
    this.text.x = Phaser.Math.linearInterpolation([this.cx, this.x], 0.8);
    this.text.y = Phaser.Math.linearInterpolation([this.cy, this.y], 0.8);
    this.fire(hud);
  }
  //Spawn enemies on short range radar
  this.showShortRange = function(distance){
    if(this.mech === null){
      var graphics = game.add.graphics();
      graphics.lineStyle(1,0xff0000,1);
      graphics.beginFill(0xff0000, 1);
      graphics.drawRect(0,0,7,7);
      var xMax = centerX + Math.cos(this.referenceAngle)*radarRadius;
      var yMax = centerY + Math.sin(this.referenceAngle)*radarRadius;
      var x = Phaser.Math.linearInterpolation([centerX, xMax], distance/(radarRadius));
      var y = Phaser.Math.linearInterpolation([centerY, yMax], distance/(radarRadius));
      var texture = graphics.generateTexture();
      this.mech = enemyMechs.create(x, y, graphics.generateTexture());
      this.mech.anchor.setTo(0.5,0.5);
      graphics.destroy();
    }
    else{
      if(!this.mech.alive){
        this.mech.revive();
      }
      var xMax = centerX + Math.cos(this.referenceAngle)*radarRadius;
      var yMax = centerY + Math.sin(this.referenceAngle)*radarRadius;
      var x = Phaser.Math.linearInterpolation([centerX, xMax], distance/(radarRadius));
      var y = Phaser.Math.linearInterpolation([centerY, yMax], distance/(radarRadius));
      this.mech.x = x;
      this.mech.y = y;
    }
    this.sgfx.clear(); //erases lineStyle data, among other things
    this.sgfx.lineStyle(1,0xff0000,1);
    this.sgfx.moveTo(0,0); //reposition relative to its own initialized origin
    this.sgfx.lineTo(this.mech.x - this.sgfx.x, this.mech.y - this.sgfx.y);
  }
};

RFEnemy.prototype = Object.create(VirtualPhysicsObject.prototype);
RFEnemy.prototype.constructor = RFEnemy;
