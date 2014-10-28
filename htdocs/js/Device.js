function Device(locations, color) {

  var startTime = new Date();

  var life = 50;
  var remaining_life = life;
  var _locations = {};

  this.r = color.r;
  this.g = color.g;
  this.b = color.b;


  this.setLocation = function(station, distance){
    _locations[station] = distance;
  };

  this.draw = function(ctx){

    ctx.beginPath();
    opacity = Math.round(remaining_life/life*100)/80
		ctx.strokeStyle = "rgba("+this.r+", "+this.g+", "+this.b+"," + opacity + ")";
    ctx.lineWidth=3;

    var locationKeys = Object.keys(_locations);

    for(var i = 0; i < locationKeys.length; i++){
      ctx.arc(locations[i].x, locations[i].y, _locations[i].distance, Math.PI*2, false);
      ctx.stroke();
      locations[i].radius = locations[i].radius + (0.1 * delta);
    }
  };
}