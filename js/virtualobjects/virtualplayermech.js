VirtualPlayerMech = function(x, y){
  //Inheritance
  VirtualPhysicsObject.call(this, x, y);

  //Overriden virtual physics
  this.virtualMaxVel = 2*VirtualPhysicsObject.prototype.virtualMaxVel;
}

VirtualPlayerMech.prototype = Object.create(VirtualPhysicsObject.prototype);
VirtualPlayerMech.prototype.constructor = VirtualPlayerMech;
