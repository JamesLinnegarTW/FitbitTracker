var bleno = require('bleno');
var name = 'name';
var serviceUuids = ['fffffffffffffffffffffffffffffff0']
bleno.startAdvertising(name, serviceUuids);