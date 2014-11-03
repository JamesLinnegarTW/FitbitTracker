

$(function(){
    var canvas = $("#canvas");
    var ctx = canvas.getContext("2d");

    var lastRender = new Date();
    var lastUpdate = new Date();
    var stations = {};
    var devices = {};
    var particles = [];

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

    var socket = io.connect('http://'+window.location.hostname+'/');

		function randomColor(){
			return {r:Math.floor((Math.random() * 255) + 1),
							g:Math.floor((Math.random() * 255) + 1),
							b:Math.floor((Math.random() * 255) + 1)};
		}

    socket.on('connect', function () {
      socket.emit('client',{});
    	socket.on('new_station', function(data){
    		stations[data.n] = new Station(data.n, 50,50);

    	});

    	socket.on('remove_station', function(data){
    		if(stations[data.n]) delete stations[data.n];
    	});

      socket.on('ble_data', function(data){

      	var stationID = data.station;


          if(!devices[data.uuid]){
            var color = randomColor();
            if(knownUUIDs[data.uuid]){
              data.name = knownUUIDs[data.uuid].name;
              color = knownUUIDs[data.uuid].color;
            }

          	devices[data.uuid]  = new Device(data.name, data.uuid, color);
          }

          if(!devices[data.uuid].name && data.name){
            if(knownUUIDs[data.uuid]){
              data.name = knownUUIDs[data.uuid].name;
            } else {
              devices[data.uuid].name = data.name;
            }
          }

          devices[data.uuid].updateData(stationID, data.distance);

  				var scale = (data.distance / 100 ) * 1000;

  				if(!stations[stationID]) {
    				stations[stationID] = new Station(stationID, 50,20);
    			}


      });

    });



    function draw() {
      var tmpCanvas = document.createElement('canvas');
		      tmpCanvas.width = W;
		      tmpCanvas.height = H;

      var tmpCtx = tmpCanvas.getContext("2d");
      var now = new Date();

      tmpCtx.fillStyle = "black";
      tmpCtx.fillRect(0, 0, W, H);

       if(particles.length > 0){

         for(var i = 0; i < particles.length; i++) {
           if(!particles[i].draw(tmpCtx)){
             particles.splice(i,1);
             i--;
           }
         }
       }


      var drawDevices = ((new Date() - lastUpdate) > 1000);
      var listHeight = -1;


      tmpCtx.font = "15px Georgia";

      for(deviceKey in devices){
        listHeight++
				var device = devices[deviceKey];
        var textOpacity = device.isActive()?1:0.3;
        var startOpacity = device.isActive()?1:0.1;

        if((now - device.lastSeen) > 300000) {
      		delete devices[deviceKey];
      	} else {
  	    	tmpCtx.fillStyle = "rgba(" + device.color.r + ","  + device.color.g + ","  + device.color.b + "," + textOpacity + ")";

          tmpCtx.fillRect(10, 30 + (listHeight * 40), 10, 10);

          tmpCtx.fillText(device.name + " (" + device.uuid +")", 30, 40 + (listHeight * 40));
        }

        if(drawDevices){
          var data = device.getData(10000);

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

      requestAnimationFrame(draw);
    }


    requestAnimationFrame(draw);



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

      var offsetY = canvas.offset().top;
      var offsetX = canvas.offset().left;

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

      if(rawX < 100){
        for(deviceKey in devices){
          var device = devices[deviceKey];
          index++;
          var top = (index * 40)-20;
          var bottom = (index  * 40)+20;


          if((rawY >= top) && (rawY <= bottom) ) {

            if(rawX < 30){
              if(device.isActive()){
                device.mute();
              } else {
                device.highlight();
              }
            } else {
              device.color= randomColor();
            }
          }
        }
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


