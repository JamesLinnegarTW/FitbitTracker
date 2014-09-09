function Particle(x, y, particleSize, color) {

  var startTime = new Date();

  var location = {x: x, y: y};

  var radius = particleSize;

  var life = 100;
  var remaining_life = life;

  this.r = color.r;
  this.g =	color.g;
  this.b = color.b;

  this.draw = function(ctx){
    var delta = (new Date() - (startTime || new Date())) / 100;

    ctx.beginPath();
    opacity = Math.round(remaining_life/life*100)/80

    var gradient = ctx.createRadialGradient(location.x, location.y, 0, location.x, location.y, radius);
    gradient.addColorStop(0, "rgba("+this.r+", "+this.g+", "+this.b+", "+opacity+")");
    gradient.addColorStop(0.5, "rgba("+this.r+", "+this.g+", "+this.b+", "+opacity+")");
    gradient.addColorStop(1, "rgba("+this.r+", "+this.g+", "+this.b+", 0)");

    ctx.fillStyle = "rgba("+this.r+", "+this.g+", "+this.b+"," + opacity + ")"; //gradient;
		ctx.strokeStyle = "rgba("+this.r+", "+this.g+", "+this.b+"," + opacity + ")"; //gradient;
    ctx.lineWidth=3;
    ctx.arc(location.x, location.y, radius, Math.PI*2, false);
    ctx.stroke();

    remaining_life = remaining_life - (1 * delta);
    radius = radius + (0.1 * delta);

    startTime = new Date();
    if((remaining_life < 0 || radius < 0) ) {
      return false; //kill the particle
    } else {
      return true;
    }
  };
}