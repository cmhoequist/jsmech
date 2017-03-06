VirtualEnemyMech = function(x, y){
  //Inheritance
  VirtualPhysicsObject.call(this, x, y);

  //Housekeeping
  virtualEnemyMechs.push(this);

  //Initialize Representation
  this.incarnations = {radar:null, rangefinder:null};
  this.incarnations.rangefinder = spawnRangefinderEnemy();

  //Combat Information
  this.effectiveRange = 8000;
  this.disabled = false;

  //Expect no subclassing, instance methods follow
  this.updateBehavior = function(targetPos){
    if(!this.disabled){
        this.moveToward(targetPos.x, targetPos.y);
        if(Math.abs(targetPos.x - this.virtualPos.x) < this.virtualMaxVel && Math.abs(targetPos.y - this.virtualPos.y) < this.virtualMaxVel){
          this.disabled = true; //TODO: something better here
        }
    }
    for(var avatar in this.incarnations){
      if(this.incarnations[avatar] !== null){
          this.incarnations[avatar].updateDisplay(targetPos, this);
      }
    }
    if(Math.abs(this.virtualPos.x-centerX) < radarRadius && Math.abs(this.virtualPos.y-centerY) < radarRadius){
      if(this.incarnations.radar === null){
        var deltax = this.virtualPos.x - targetPos.x;
        var deltay = this.virtualPos.y - targetPos.y;
        var referenceAngle = Math.atan2(deltay, deltax); // range (-PI, PI]
        if(this.referenceAngle < 0){
          this.referenceAngle += 2*Math.PI; // range [0, 2PI]
        }
        var x = centerX + Math.cos(referenceAngle)*radarRadius;
        var y = centerY + Math.sin(referenceAngle)*radarRadius;
        this.incarnations.radar = spawnRadarEnemy(x, y);
      }
      else if(!this.incarnations.radar.alive){
        this.incarnations.radar.revive();
      }
    }
  }
}

VirtualEnemyMech.prototype = Object.create(VirtualPhysicsObject.prototype);
VirtualEnemyMech.constructor = VirtualEnemyMech;

function spawnRadarEnemy(x, y){
  var graphics = game.add.graphics();
  graphics.lineStyle(1,0xff0000,1);
  graphics.beginFill(0xff0000, 1);
  graphics.drawRect(0,0,7,7);
  var dMech = new RadarEnemyMech(game, x, y, graphics.generateTexture());
  graphics.destroy();
  return dMech;
}

function spawnRangefinderEnemy(){
  var angle = 0, h = 10;
  var x = rangefinder.x+Math.cos(angle)*rangefinder.r;
  var y = rangefinder.y+Math.sin(angle)*rangefinder.r;
  var graphics = game.add.graphics(x,y);
  graphics.lineStyle(4,0xffffff,1);
  graphics.lineTo(Math.cos(angle)*h,Math.sin(angle)*h);
  var dMech = new RangefinderEnemyMech(game, x, y, graphics.generateTexture())
  enemyMechs.add(dMech);
  graphics.destroy();
  game.world.bringToTop(enemyMechs); //for reasons not entirely clear to me, sprites in this group will otherwise be painted underneath objects painted by 'graphics'
  return dMech;
}
