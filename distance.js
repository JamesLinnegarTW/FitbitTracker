var noble = require('noble');
var math = require('mathjs');
var stationName = process.argv[3];
var socket = require('socket.io-client')('http://' + process.argv[2] + ':8081');
var x = process.argv[4];
var y = process.argv[5];

var clients = [];
console.log("Starting station " + stationName);
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


socket.on('connect', function(){
  socket.emit('new_station', {n:stationName,x:x,y:y});
});


function exitHandler(options, err) {
    console.log('exiting');
    socket.emit('remove_station', {n:stationName});
    process.exit();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([],true);
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', function(peripheral) {

    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;

    var device = {};

    device.name = localName;
    device.uuid = peripheral.uuid;
    device.distance = distanceMagic(peripheral.rssi);
    device.station = stationName;

    function distanceMagic(rssi){
      var distance = d1 * Math.pow(10, (r1 - rssi) / (10 * n)); //float
      return distance;
    }

    sendToAll(device);
});

function sendToAll(data){
  socket.emit('d_data', data);
}

