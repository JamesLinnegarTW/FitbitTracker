var staticF = require('node-static');
var file = new staticF.Server('./htdocs');
var http = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8081);
var clients = [];

var mdns = require('mdns');

var ad = mdns.createAdvertisement(mdns.tcp('fitbit'),8081);
ad.start();

var io = require('socket.io').listen(http);
io.sockets.on('connection', function(socket){

	socket.on('view_client', function(){
		console.log('view connected');
		clients.push(socket);
	});

	socket.on('new_station', function(data){
		console.log('new station '+ data.n + ' connected');
		io.sockets.emit('new_station', data);
	});

	socket.on('remove_station', function(data){
		console.log('remove station '+data.n);
		io.sockets.emit('remove_station', data);
	});

	socket.on('d_data', function(data){
		io.sockets.emit('ble_data', data);
	});

})

