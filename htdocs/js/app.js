

$(function(){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var lastRender = new Date();
    var lastUpdate = new Date();
    var stations = {};
    var devices = {};
    var particles = [];

    var dragID;
    var scale = 1000;

    var   W = window.innerWidth ,
          H = window.innerHeight;


    canvas.width = W;
    canvas.height = H;


   window.onresize = function(){
     W = window.innerWidth;
     H = window.innerHeight;
     canvas.width = W;
     canvas.height = H;
     document.getElementById('container').style.height = H +'px';
     document.getElementById('container').style.width = W + 'px';

   };




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

        if(data.name){
          if(!devices[data.uuid]){
          	devices[data.uuid]  = new Device(data.name, data.uuid, randomColor());
          }

          devices[data.uuid].updateData(stationID, data.distance);

  				var scale = (data.distance / 100 ) * 1000;

  				if(!stations[stationID]) {
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


      var drawDevices = ((new Date() - lastUpdate) > 1000);

      for(var i = 0; i < deviceKeys.length; i++){

				var device = devices[deviceKeys[i]];

        if((now - device.lastSeen) > 300000) {
      		delete devices[deviceKeys[i]];
      	} else {
  	    	tmpCtx.fillStyle = "rgb(" + device.color.r + ","  + device.color.g + ","  + device.color.b + ")";
		      tmpCtx.fillText(device.name  + " " + device.uuid, 10, 30 + (i * 20));
        }

        if(drawDevices){
          var data = device.getData();

          for(var d = 0; d < data.length; d++){
            var scale = (data[d].d / 100 ) * 1000;
            var station = stations[data[d].s];
            if(station) {
              var coords = station.getCoords();
              particles.push(new Particle(coords.x, coords.y, scale, device.color));
            }
          }
       }
      }

      if(drawDevices) {
        lastUpdate = new Date();
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


