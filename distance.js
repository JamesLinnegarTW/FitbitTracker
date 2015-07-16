var noble = require('noble');
var math = require('mathjs');
var os = require('os');
var fs = require('fs');
var gpio = require('rpi-gpio');
 

var stationName = os.hostname();

var devices = {};
var x = 50;
var y = 50;


var lightDelay;


var clients = [];
var devices = [];

var r1 = -55.0; //float
var d1 = 1.5; //float

var r2 = -90.0; //float
var d2 = 20.0; //float

// constant to account for loss due to reflection, polzarization, etc
// n will be ~2 for an open space
// n will be ~3 for "typical" environment
// n will be ~4 for a cluttered industrial site
var n = (r2 - r1) / (10 * math.log10(d1 / d2)); //float

function start(ip){

  var socket = require('socket.io-client')('http://' + ip + ':8081');

  console.log("Starting station " + stationName + " talking to " + ip);

  socket.on('connect', function(){
    socket.emit('new_station', {n:stationName});
  });


  function exitHandler(options, err) {
    console.log('exiting');
    socket.emit('remove_station', {n:stationName});
    console.log({n:stationName});
    setTimeout(function(){process.exit();},1000);
  }

  process.on('exit', exitHandler.bind(null,{cleanup:true}));

  noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      noble.startScanning([],true);
      console.log('start');
    } else {
      noble.stopScanning();
      console.log('stop');
    }
  });


  function distanceMagic(rssi){
    var distance = d1 * Math.pow(10, (r1 - rssi) / (10 * n)); //float
    return distance;
  }


  noble.on('discover', function(peripheral) {
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;

    var device = {};

    device.name =     localName;
    device.uuid =     peripheral.uuid;
    device.distance = distanceMagic(peripheral.rssi);
    device.station =  stationName;
    device.rssi =     peripheral.rssi;



    if(!devices[peripheral.uuid]){
      devices[peripheral.uuid] = device;
    }
    if(device.uuid == process.argv[3]){
      if(device.distance < 5) {
        turnOnLight();
      } else {
        turnOffLight();
      }
    }

    sendToServer(device);
  });



  function sendToServer(data){
    console.log(data);
    socket.emit('d_data', data);
  }



 
function write() {
    gpio.write(7, false, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}

  function turnOnLight(){
    gpio.write(7, true, function(err) {
        if (err) throw err;
        console.log('Written to pin HIGH');
    });
    if(lightDelay) clearTimeout(lightDelay);
    lightDelay = setTimeout(turnOffLight, 15000);
  }
  function turnOffLight(){
      gpio.write(7, false, function(err) {
        if (err) throw err;
        console.log('Written to pin LOW');
    });
    if(lightDelay) clearTimeout(lightDelay);
  }

  noble.startScanning([],true);

}
gpio.setup(7, gpio.DIR_OUT, function(){
  start(process.argv[2]);
});

