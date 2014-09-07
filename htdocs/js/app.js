

$(function(){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var lastRender = new Date();
    var stations = {};
    var stations = [];

		var   W = window.innerWidth - 20,
		   		H = window.innerHeight - 20;

		var particles = [];

		var devices = {};


    canvas.width = W;
    canvas.height = H;


    var socket = io.connect('http://'+window.location.hostname+'/');

		function randomColor(){
			return {r:Math.floor((Math.random() * 255) + 1),
							g:Math.floor((Math.random() * 255) + 1),
							b:Math.floor((Math.random() * 255) + 1)};
		}

    socket.on('connect', function () {

    	socket.on('new_station', function(data){
    		stations[data.n] = new Station(data.n, W/2,H/2);
    	});

    	socket.on('remove_station', function(data){
    		if(stations[data.n]) delete stations[data.n];
    	});

      socket.on('ble_data', function(data){
      	var stationID = data.station;

        if(!devices[data.uuid]){
        	devices[data.uuid] = data;
        	devices[data.uuid].color = randomColor();
        	devices[data.uuid].distanceAverages = [];
        	devices[data.uuid].avIndex = 0;
        	devices[data.uuid].avDistance = 0;
        } else {
        	devices[data.uuid].distance = data.distance;
        	var avIndex = devices[data.uuid].avIndex;
        	avIndex = avIndex + 1;
        	if(avIndex > 5) avIndex = 0;
        	devices[data.uuid].distanceAverages[avIndex] = {d: data.distance, t: new Date()};
        	devices[data.uuid].avIndex = avIndex;

        }
        devices[data.uuid].lastSeen = new Date();

        if(data.distance <= 25){
/*
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
          */
					var scale = (data.distance / 20 ) * (H/2);
					//var averageScale = (average / 20) * (H/2);
					if(stations[stationID]) {
						var coords = stations[stationID].getCoords();
  	        particles.push(new Particle(coords.x, coords.y, scale, devices[data.uuid].color));
    			} else {
    				stations[stationID] = new Station(stationID, W/2,H/2);

    			}
        }
      });

    });


   window.onresize = function(){
	   W = window.innerWidth;
	   H = window.innerHeight;
		 canvas.width = W;
	   canvas.height = H;
   };


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
      	if((now - device.lastSeen) > 60000) {
      		delete devices[deviceKeys[i]];
      	} else {
  	    	tmpCtx.fillStyle = "rgb(" + device.color.r + ","  + device.color.g + ","  + device.color.b + ")";
		      tmpCtx.fillText(device.name + " " + device.distance.toFixed(2), 10, 30 + (i * 20));
      	}
      }


     	var stationKeys = Object.keys(stations);

      for(var i = 0; i < stationKeys.length; i++){
				var station = stations[stationKeys[i]];
      	station.draw(tmpCtx, H/4);
      }

      ctx.drawImage(tmpCanvas, 0, 0);
      lastRender = new Date();

      requestAnimationFrame(draw, canvas);
    }


    requestAnimationFrame(draw, canvas);



    $('#canvas').on('click', function(evt){
      console.log(evt.clientX);
      //evt.clientY;
      console.log(stations['A']);
      stations['A'].setCoords(evt.clientX, evt.clientY);
    });
  });


