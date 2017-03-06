//Intended as Rangefinder enemy mech representation, can probably be reused for Radar enemy mech representation as well
RadarEnemyMech = function(game, x, y, texture){
  //Inheritance
  RepresentationObject.call(this, game, x, y, texture);

  //HUD component positioning
  this.cx = radar.x;
  this.cy = radar.y;
  this.radius = radar.r;
  this.referenceAngle; //angle between the Sprite and the origin of its HUD component

}

RadarEnemyMech.prototype = Object.create(RepresentationObject.prototype);
RadarEnemyMech.constructor = RadarEnemyMech;

extendPrototype(RadarEnemyMech.prototype, {
  updateDisplay : function(targetPos, vpo){
    //Recalculate position on HUD component circumference: angle can be found from distance components
    var deltax = vpo.virtualPos.x - targetPos.x;
    var deltay = vpo.virtualPos.y - targetPos.y;
    var referenceAngle = Math.atan2(deltay, deltax); // range (-PI, PI]
    if(this.referenceAngle < 0){
      this.referenceAngle += 2*Math.PI; // range [0, 2PI]
    }
    var distance = Math.sqrt(deltax*deltax + deltay*deltay);
    var xMax = centerX + Math.cos(referenceAngle)*radarRadius;
    var yMax = centerY + Math.sin(referenceAngle)*radarRadius;
    this.x = Phaser.Math.linearInterpolation([centerX, xMax], distance/(radarRadius));
    this.y = Phaser.Math.linearInterpolation([centerY, yMax], distance/(radarRadius));
  }
});
