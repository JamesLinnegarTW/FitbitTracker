function Station(name, x, y, socket){

	var _name = name;
	var _x = x;
	var _y = y;
	var _socket = socket;

	this.getName = function(){
		return _name;
	}

	this.getCoords = function(){
		return {'x':_x,
						'y':_y};
	}

	this.setCoords = function(x,y){
		_x = x;
		_y = y;
	}


	this.draw = function (tmpCtx, scale){
			var centerX = (_x / 100 ) * 1000;
			var centerY = (_y / 100 ) * 1000;

      tmpCtx.strokeStyle = "rgba(255,255,255,0.05)";
			tmpCtx.fillStyle = "white";

			tmpCtx.fillText(name, centerX - (tmpCtx.measureText(_name).width /2),  centerY + 5);
			tmpCtx.lineWidth=3;

			tmpCtx.beginPath();
	    tmpCtx.arc(centerX, centerY, (5/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("5ft", ((x) + (5/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(centerX, centerY, (10/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("10ft", ((x) + (10/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(centerX, centerY, (15/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("15ft", ((x) + (15/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(centerX, centerY, (20/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();

	    tmpCtx.beginPath();
	    tmpCtx.arc(centerX, centerY, (25/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
	    //tmpCtx.fillText("20ft", ((x) + (30/30) * (y)) + 10, (y)+5);
	}
}