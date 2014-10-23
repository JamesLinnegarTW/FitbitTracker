var noble = require('noble');
var math = require('mathjs');
var os = require('os');
var stationName = os.hostname();

var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('fitbit'));

browser.on('serviceUp', function(service){
 start(service.addresses[0]);
 browser.stop();
});

browser.on('serviceDown', function(service){
//  process.exit();
});

browser.start();


var clients = [];
var devices = [];


var r1 = -55.0; //float
var d1 = 1.5; //float

// sample #2 from environment (rssi -75dBm = distance 20ft)
var r2 = -90.0; //float
var d2 = 20.0; //float

// constant to account for loss due to reflection, polzarization, etc
// n will be ~2 for an open space
// n will be ~3 for "typical" environment
// n will be ~4 for a cluttered industrial site
var n = (r2 - r1) / (10 * math.log10(d1 / d2)); //float

function start(ip){
console.log(ip);
  var socket = require('socket.io-client')('http://' + ip + ':8081');

  console.log("Starting station " + stationName);

  socket.on('connect', function(){
    socket.emit('new_station', {n:stationName});
  });


  function exitHandler(options, err) {
  //    console.log('exiting');
  //    socket.emit('remove_station', {n:stationName});
 //     console.log({n:stationName});
//      process.exit();
  }

//  process.on('exit', exitHandler.bind(null,{cleanup:true}));

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
    console.log(advertisement);
    if(advertisement.localName){

      var localName = advertisement.localName;
      var txPowerLevel = advertisement.txPowerLevel;

      var device = {};

      device.name =     localName;
      device.uuid =     peripheral.uuid;
      device.distance = distanceMagic(peripheral.rssi);
      device.station =  stationName;
      device.rssi =     peripheral.rssi;
      device.time = new Date();

      sendToServer(device);
    }
  });

  function sendToServer(data){
    console.log(data);
    socket.emit('d_data', data);
  }
    noble.startScanning([],true);
}
