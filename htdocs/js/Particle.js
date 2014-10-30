function Particle(x, y, particleSize, color, startOpacity) {

  var startTime = new Date();

  var location = {x: (x/100) * 1000, y: (y/100) * 1000};

  var radius = particleSize;

  var life = 50;
  var remaining_life = life;

  this.r = color.r;
  this.g =	color.g;
  this.b = color.b;

  this.draw = function(ctx){
    var delta = (new Date() - (startTime || new Date())) / 100;

    ctx.beginPath();

    opacity = (Math.round(remaining_life/life*100)/80) * startOpacity;


    ctx.fillStyle = "rgba("+this.r+", "+this.g+", "+this.b+"," + opacity + ")";
		ctx.strokeStyle = "rgba("+this.r+", "+this.g+", "+this.b+"," + opacity + ")";
    ctx.lineWidth=3;
    ctx.arc(location.x, location.y, radius, Math.PI*2, false);
    ctx.stroke();

    remaining_life = remaining_life - (1.5 * delta);
    radius = radius + (0.4 * delta);

    startTime = new Date();
    if((remaining_life < 0 || radius < 0) ) {
      return false; //kill the particle
    } else {
      return true;
    }
  };
}