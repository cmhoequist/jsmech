//Subclasses Sprite, is the display object corresponding to a VirtualPhysicsObject
RepresentationObject = function(game, x, y, texture){
  //Inheitance
  Phaser.Sprite.call(this, game, x, y, texture);
  game.add.existing(this); //Adds an existing display object to the world

  //Housekeeping
  this.anchor.setTo(0.5, 0.5);
}

RepresentationObject.prototype = Object.create(Phaser.Sprite.prototype);
RepresentationObject.prototype.constructor = RepresentationObject;
