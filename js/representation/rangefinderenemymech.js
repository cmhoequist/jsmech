//Intended as Rangefinder enemy mech representation, can probably be reused for Radar enemy mech representation as well
RangefinderEnemyMech = function(game, x, y, texture){
  //Inheritance
  RepresentationObject.call(this, game, x, y, texture);

  //HUD component positioning
  this.cx = rangefinder.x;
  this.cy = rangefinder.y;
  this.radius = rangefinder.r;
  this.displayAngle = 0; //angle at which the Sprite should be tilted around its anchor
  this.referenceAngle; //angle between the Sprite and the origin of its HUD component

  //Informational text
  this.style = { font: '12px courier', fill: '#ffffff'};
  this.text = game.add.text(x,y, '', this.style);
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.effectiveRange = 8000;
  this.defaultFontSize = 12;
  this.maxTextScale = 4;
  this.minTextScale = 1;
}

RangefinderEnemyMech.prototype = Object.create(RepresentationObject.prototype);
RangefinderEnemyMech.constructor = RangefinderEnemyMech;

extendPrototype(RangefinderEnemyMech.prototype, {
  updateDisplay : function(targetPos, vpo){
    //Recalculate position on HUD component circumference: angle can be found from distance components
    var deltax = vpo.virtualPos.x - targetPos.x;
    var deltay = vpo.virtualPos.y - targetPos.y;
    this.referenceAngle = Math.atan2(deltay, deltax); // range (-PI, PI]
    if(this.referenceAngle < 0){
      this.referenceAngle += 2*Math.PI; // range [0, 2PI]
    }
    //Reposition Sprite on HUD
    this.x = this.cx + Math.cos(this.referenceAngle) * this.radius;
    this.y = this.cy + Math.sin(this.referenceAngle) * this.radius;

    var deg = this.referenceAngle/(Math.PI)*180; //Convert to deg
    this.angle = deg; //Tilt Sprite appropriately
    //Reposition text on HUD
    this.text.x = Phaser.Math.linearInterpolation([this.cx, this.x], 0.8);
    this.text.y = Phaser.Math.linearInterpolation([this.cy, this.y], 0.8);
    //Color code Sprite and size code Text for enemy ranges
    var distance = Math.sqrt(deltax*deltax + deltay*deltay);
    var pct = distance > vpo.effectiveRange ? -1 : distance/vpo.effectiveRange;
    var c = pct < 0 ? 0x0000ff : Phaser.Color.interpolateColor(0xff0000, 0x00ff00, this.effectiveRange, this.effectiveRange*pct, 1); //start, end, numSteps, currentStep, alpha
    this.tint = c; //Scales red to green, jumps to blue if beyond effective weapon range
    //y = c + ab^-dx: desired scaling is x2 to x1 size from distance ~0 to 500, constants chosen accordingly
    this.text.fontSize = this.defaultFontSize*(this.minTextScale + (this.maxTextScale - this.minTextScale)*Math.pow(2, -0.01*distance));
    this.text.setText(Math.floor(distance).toString());
  }
});
