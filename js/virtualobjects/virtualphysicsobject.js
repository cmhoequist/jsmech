//Subclasses Sprite, adds support for virtual kinematics
VirtualPhysicsObject = function(x, y){
  //Inheritance - TODO: no inheritance! Decouple virtual motion from displayed motion.
  // Phaser.Sprite.call(this, game, x, y, texture);
  // game.add.existing(this); //Adds an existing display object to the world

  //Housekeeping
  // this.anchor.setTo(0.5,0.5);

  //Virtual physics
  this.virtualPos = {x: x, y: y};
  this.virtualVel = {x: 0, y: 0};
  this.virtualAcc = {x: 0, y: 0};
  this.virtualEngineAcc = 1;
  this.virtualDragCoeff = 0.2;
  this.virtualMaxVel = 1; //13 in meters per second, theoretically
  this.mechVirtualX = 0;
  this.mechVirtualY = 0;
  this.virtualDistance;
}

// VirtualPhysicsObject.prototype = Object.create(Phaser.Sprite.prototype);
// VirtualPhysicsObject.prototype.constructor = VirtualPhysicsObject;

//Extend prototype with member functions
extendPrototype = function(prototype, fns){
  for(var f in fns){
    prototype[f] = fns[f];
  }
}

extendPrototype(VirtualPhysicsObject.prototype, {
  updateAcc : function(accx, accy){
    this.virtualAcc.x = accx;
    this.virtualAcc.y = accy;
    this.move();
  },

  //Maneuvering update function
  move: function(){
    var delta = 0;
    for(var attr in this.virtualPos){ //classical physics fields (x,v,a) all have the same attributes (x-coord, y-coord)
      delta += -this.virtualVel[attr]*this.virtualDragCoeff; //apply drag in opposite direction of motion
      delta += this.virtualAcc[attr];
      this.virtualVel[attr] += delta; //update velocity
      if(this.virtualVel[attr] < -this.virtualMaxVel){ //cap at max speed
        this.virtualVel[attr] = -this.virtualMaxVel;
      }
      else if(this.virtualVel[attr] > this.virtualMaxVel){
        this.virtualVel[attr] = this.virtualMaxVel;
      }
      this.virtualPos[attr] += this.virtualVel[attr]; //update position
      delta = 0; //reset for each attribute we loop through
    }
  },

  //Directed movement given an angle in rads
  directedMove : function(direction){
    this.virtualAcc.x = Math.cos(direction)*this.virtualEngineAcc;
    this.virtualAcc.y = Math.sin(direction)*this.virtualEngineAcc;
    this.move();
  },

  //Directed movement given target coordinates
  moveToward : function(x , y){
    var xdif = x - this.virtualPos.x;
    var ydif = y - this.virtualPos.y;
    var angle = Math.atan2(ydif, xdif); // range (-PI, PI]
    if(angle < 0){
      angle += 2*Math.PI; // range [0, 2PI]
    }
    this.directedMove(angle);
  }
});
