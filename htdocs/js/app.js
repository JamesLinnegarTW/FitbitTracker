

$(function(){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var lastRender = new Date();
    var stations = {};
    var stations = [];
    var dragID;

    var   W = window.innerWidth ,
          H = window.innerHeight;


    canvas.width = W;
    canvas.height = H;


   window.onresize = function(){
     W = window.innerWidth;
     H = window.innerHeight;
     canvas.width = W;
     canvas.height = H;
   };


		var particles = [];

		var devices = {};


    var socket = io.connect('http://'+window.location.hostname+'/');

		function randomColor(){
			return {r:Math.floor((Math.random() * 255) + 1),
							g:Math.floor((Math.random() * 255) + 1),
							b:Math.floor((Math.random() * 255) + 1)};
		}

    socket.on('connect', function () {

    	socket.on('new_station', function(data){
    		stations[data.n] = new Station(data.n, 50,50);
    	});

    	socket.on('remove_station', function(data){
    		if(stations[data.n]) delete stations[data.n];
    	});

      socket.on('ble_data', function(data){
      	var stationID = data.station;

        if(!devices[data.name]){

        	devices[data.name] = data;
        	devices[data.name].color = randomColor();
        	devices[data.name].distanceAverages = [];
        	devices[data.name].avIndex = 0;
        	devices[data.name].avDistance = 0;
        } else {
        	devices[data.name].distance = data.distance;
        	var avIndex = devices[data.name].avIndex;
        	avIndex = avIndex + 1;
        	if(avIndex > 5) avIndex = 0;
        	devices[data.name].distanceAverages[avIndex] = {d: data.distance, t: new Date()};
        	devices[data.name].avIndex = avIndex;

        }
        devices[data.name].lastSeen = new Date();

        if(data.distance <= 25){

          var total = 0;
          for(var i = 0; i < devices[data.uuid].distanceAverages.length; i++){
          	console.log(devices[data.uuid].distanceAverages[i]);
            total = total + devices[data.uuid].distanceAverages[i].d;
          }

          var average;
          if(total > 0) {
	          average = total / devices[data.uuid].distanceAverages.length;
	         } else {
	         	average = 0;
	         }
					devices[data.uuid].avDistance = average;
          
					var scale = (data.distance / 100 ) * 1000;
					var averageScale = (average / 100) * 1000;
					if(stations[stationID]) {
						var coords = stations[stationID].getCoords();
  	        particles.push(new Particle(coords.x, coords.y, averageScale, devices[data.name].color));
    			} else {
    				stations[stationID] = new Station(stationID, 50,20);

    			}
        }
      });

    });


    function resetCanvas(rCtx){
      rCtx.fillStyle = "black";
      rCtx.fillRect(0, 0, W, H);
    }

    function draw() {
      var tmpCanvas = document.createElement('canvas');
		      tmpCanvas.width = W;
		      tmpCanvas.height = H;

      var tmpCtx = tmpCanvas.getContext("2d");
      var now = new Date();

      resetCanvas(tmpCtx);

      if(particles.length > 0){

        for(var i = 0; i < particles.length; i++) {
          if(!particles[i].draw(tmpCtx)){
            particles.splice(i,1);
            i--;
          }
        }
      }

      tmpCtx.font = "15px Georgia";
      tmpCtx.fillStyle = "white";

      var deviceKeys = Object.keys(devices);

      for(var i = 0; i < deviceKeys.length; i++){
				var device = devices[deviceKeys[i]];
      	if((now - device.lastSeen) > 300000) {
      		delete devices[deviceKeys[i]];
      	} else {
  	    	tmpCtx.fillStyle = "rgb(" + device.color.r + ","  + device.color.g + ","  + device.color.b + ")";
		      tmpCtx.fillText(device.name  + " " + device.distance.toFixed(2), 10, 30 + (i * 20));
      	}
      }


     	var stationKeys = Object.keys(stations);

      for(var i = 0; i < stationKeys.length; i++){
				var station = stations[stationKeys[i]];
      	station.draw(tmpCtx, (20/ 100) * 1000);
      }

      ctx.drawImage(tmpCanvas, 0, 0);
      lastRender = new Date();

      requestAnimationFrame(draw, canvas);
    }


    requestAnimationFrame(draw, canvas);

    function moving(evt){
                var offsetY = $('#canvas').offset().top;

     var offsetX = $('#canvas').offset().left;
      evt.preventDefault();
      if(evt.touches){
        var x = evt.touches[0].clientX- offsetX;
        var y = evt.touches[0].clientY- offsetY;
      } else {
        var x = evt.clientX- offsetX;
        var y = evt.clientY- offsetY;
      }

      if(dragID && stations[dragID]){
        stations[dragID].setCoords((x / 1000) * 100, (y / 1000) * 100);
        particles = [];
      }

      return false;
    }

    function startMove(evt){

      var offsetY = $('#canvas').offset().top;
      var offsetX = $('#canvas').offset().left;

      evt.preventDefault();
     // particles = [];
      if(evt.touches){
        var x = ((evt.touches[0].clientX - offsetX)/1000) * 100;
        var y = ((evt.touches[0].clientY - offsetY)/1000) * 100;
      } else {
        var x = ((evt.clientX- offsetX) / 1000) * 100;
        var y = ((evt.clientY- offsetY) / 1000) * 100;
      }

      var stationKeys = Object.keys(stations);

      for(var i = 0; i < stationKeys.length; i++){
        var station = stations[stationKeys[i]];
        var coords = station.getCoords();

        if((((coords.x - 5) < x) && ((coords.x + 5) > x)) &&
           (((coords.y - 5) < y) && ((coords.y + 5) > y))
          ){

          dragID = station.getName();
        }
      }

      //evt.preventDefaut();
      return false;
    }
    function moveEnd(){
      dragID = "";
    }

    document.addEventListener("mousedown", startMove);
    document.addEventListener("mousemove", moving);
    document.addEventListener("mouseup", moveEnd);

    document.addEventListener("touchstart", startMove);
    document.addEventListener("touchmove", moving);
    document.addEventListener("touchend", moveEnd);


});


