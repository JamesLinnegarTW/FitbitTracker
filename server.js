var staticF = require('node-static');
var file = new staticF.Server('./htdocs');
var http = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8081);

var io = require('socket.io').listen(http);
io.sockets.on('connection', function(socket){
	console.log('client');

	socket.on('new_station', function(data){
		console.log('new station '+ data.n);
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

