

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

      //  if(data.name){
          if(!devices[data.uuid]){
          	devices[data.uuid]  = new Device(data.name, data.uuid, randomColor());
          }

          devices[data.uuid].updateData(stationID, data.distance);

  				var scale = (data.distance / 100 ) * 1000;

  				if(!stations[stationID]) {
    				stations[stationID] = new Station(stationID, 50,20);
    			}
       // }

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


      var drawDevices = ((new Date() - lastUpdate) > 1000);
      var listHeight = -1;

      for(deviceKey in devices){
        listHeight++
				var device = devices[deviceKey];
        var startOpacity = device.isActive()?1:0.3;



        if((now - device.lastSeen) > 300000) {
      		delete devices[deviceKeys[i]];
      	} else {
  	    	tmpCtx.fillStyle = "rgba(" + device.color.r + ","  + device.color.g + ","  + device.color.b + "," + startOpacity + ")";
		      tmpCtx.fillText(device.name, 10, 30 + (listHeight * 30));
        }

        if(drawDevices){
          var data = device.getData();

          for(var d = 0; d < data.length; d++){
            var scale = (data[d].d / 100 ) * 1000;
            var station = stations[data[d].s];
            if(station) {
              var coords = station.getCoords();
              particles.push(new Particle(coords.x, coords.y, scale, device.color, startOpacity));
            }
          }
       }
      }

      if(drawDevices) {
        lastUpdate = new Date();
      }

      for(station in stations){
      	stations[station].draw(tmpCtx, (20/ 100) * 1000);
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
      var ctx = $('#canvas').getContext("2d");
      evt.preventDefault();

      if(evt.touches){
        var rawX = (evt.touches[0].clientX - offsetX);
        var rawY = (evt.touches[0].clientY - offsetY);
        var x = ((evt.touches[0].clientX - offsetX)/1000) * 100;
        var y = ((evt.touches[0].clientY - offsetY)/1000) * 100;
      } else {
        var rawX = (evt.clientX- offsetX);
        var rawY = (evt.clientY- offsetY);
        var x = ((evt.clientX- offsetX) / 1000) * 100;
        var y = ((evt.clientY- offsetY) / 1000) * 100;
      }

      var index = 0;

      if(rawX < 200){
        for(deviceKey in devices){
          var device = devices[deviceKey];
          index++;
          var top = (index * 30)-15;
          var bottom = (index  * 30)+15;

          console.log(top,bottom);
          if((rawY >= top) && (rawY <= bottom) ) {
            if(device.isActive()){
              device.mute();
            } else {
              device.highlight();
            }
          }
        }
      }



      for(device in devices){

      }
      for(station in stations){


        var coords = stations[station].getCoords();

        if((((coords.x - 5) < x) && ((coords.x + 5) > x)) &&
           (((coords.y - 5) < y) && ((coords.y + 5) > y))
          ){

          dragID = stations[station].getName();
        }
      }

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


