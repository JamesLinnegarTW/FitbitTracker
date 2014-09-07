function Station(name, x, y){

	var _name = name;
	var _x = x;
	var _y = y;

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

      tmpCtx.strokeStyle = "rgba(255,255,255,0.1)";
			tmpCtx.fillStyle = "white";

			tmpCtx.fillText(name, _x - (tmpCtx.measureText(_name).width /2), _y + 5);
			tmpCtx.lineWidth=3;

			tmpCtx.beginPath();
	    tmpCtx.arc(_x, _y, (5/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("5ft", ((x) + (5/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(_x, _y, (10/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("10ft", ((x) + (10/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(_x, _y, (15/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
			//tmpCtx.fillText("15ft", ((x) + (15/20) * (y)) + 10, (y)+5);

			tmpCtx.beginPath();
	    tmpCtx.arc(_x, _y, (20/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();

	    tmpCtx.beginPath();
	    tmpCtx.arc(_x, _y, (25/20) * scale, Math.PI*2, false);
	    tmpCtx.stroke();
	    //tmpCtx.fillText("20ft", ((x) + (30/30) * (y)) + 10, (y)+5);
	}
}