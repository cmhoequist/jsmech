//Subclasses Sprite, adds support for virtual kinematics
VirtualPhysicsObject = function(game, x, y, texture){
  //Inheritance
  Phaser.Sprite.call(this, game, x, y, texture);
  game.add.existing(this);

  //Housekeeping
  this.anchor.setTo(0.5,0.5);

  //Virtual physics
  this.virtualPos = {x: game.world.randomX, y: game.world.randomY};
  this.virtualVel = {x: 0, y: 0};
  this.virtualAcc = {x: 0, y: 0};
  this.virtualEngineAcc = 1;
  this.virtualDrag = 0.2*this.virtualEngineAcc;
  this.virtualMaxVel = 1; //13 in meters per second, theoretically
  this.mechVirtualX = 0;
  this.mechVirtualY = 0;
  this.virtualDistance;

  this.updateAcc = function(accx, accy){
    this.virtualAcc.x = accx;
    this.virtualAcc.y = accy;
    this.move();
  }

  //Maneuvering update function
  this.move = function(){
    var delta = 0;
    for(var attr in this.virtualPos){ //classical physics fields (x,v,a) all have the same attributes (x-coord, y-coord)
      delta += this.virtualVel[attr] > 0 ? -this.virtualDrag : this.virtualVel[attr] < 0 ? this.virtualDrag : 0; //apply drag if there is motion
      if(Math.abs(this.virtualVel[attr]) < this.virtualMaxVel){ //if under max velocity, apply acceleration
        delta += this.virtualAcc[attr];
      }
      this.virtualVel[attr] += delta; //update velocity
      this.virtualPos[attr] += this.virtualVel[attr]; //update position
      delta = 0; //reset for each attribute we loop through
    }
  }

  //Directed movement given an angle in rads
  this.directedMove = function(direction){
    this.virtualAcc.x = Math.cos(direction)*Math.sqrt(2*this.virtualEngineAcc*this.virtualEngineAcc);
    this.virtualAcc.y = Math.sin(direction)*Math.sqrt(2*this.virtualEngineAcc*this.virtualEngineAcc);
    this.move();
  }

  //Directed movement given target coordinates
  this.moveToward = function(x , y){
    console.log('going');
    var xdif = this.virtualPos.x - x;
    var ydif = this.virtualPos.y - y;
    var angle = Math.atan2(ydif, xdif); // range (-PI, PI]
    if(angle < 0){
      angle += 2*Math.PI; // range [0, 2PI]
    }
    this.directedMove(angle);
  }
}

VirtualPhysicsObject.prototype = Object.create(Phaser.Sprite.prototype);
VirtualPhysicsObject.prototype.constructor = VirtualPhysicsObject;
