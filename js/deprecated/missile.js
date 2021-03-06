Missile = function(game, x, y, texture, spawnAngle){
  //Inheritance
  VirtualPhysicsObject.call(this, game, x, y, texture);

  //Direction
  this.direction = spawnAngle;

  //Override virtual physics
  this.virtualEngineAcc = 0; //Just as a quick and dirty prototype, missiles don't change speed
  this.virtualDragCoeff = 0;
  this.virtualMaxVel = 5;
  this.virtualPos = {x: x, y: y};
  this.virtualVel;

  this.move = function(){
    this.virtualVel = {x: -Math.cos(this.direction)*this.virtualMaxVel, y: -Math.sin(this.direction)*this.virtualMaxVel};
    VirtualPhysicsObject.prototype.move.call(this);
    this.x = this.virtualPos.x;
    this.y = this.virtualPos.y;
    var x = this.x - centerX;
    var y = this.x - centerY;
    if(Math.abs(this.x - centerX) >= radarRadius && Math.abs(this.y - centerY) >= radarRadius){
      this.kill();
    }
  }
}

Missile.prototype = Object.create(VirtualPhysicsObject.prototype);
Missile.prototype.constructor = Missile;
