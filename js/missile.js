Missile = function(game, x, y, texture){
  //Inheritance
  VirtualPhysicsObject.call(this, game, x, y, texture);

}

Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;
