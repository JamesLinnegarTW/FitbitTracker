function Device(locations, color) {

  var startTime = new Date();

  var life = 100;
  var remaining_life = life;
  var _locations = {};

  this.r = color.r;
  this.g = color.g;
  this.b = color.b;


  this.setLocation = function(station, distance){
    _locations[station] = distance;
  };

  this.draw = function(ctx){
   // var delta = (new Date() - (startTime || new Date())) / 100;




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

  //  remaining_life = remaining_life - (1 * delta);

   // startTime = new Date();
/*
    if((remaining_life < 0) ) {
      return false; //kill the particle
    } else {
      return true;
    }

    */
  };
}