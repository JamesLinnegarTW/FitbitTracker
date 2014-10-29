function Device(name, uuid, color) {
  var stationData = {};
  this.name = name;

  this.uuid = uuid;

  this.color = color;


  this.updateData = function(station, distance){
      if(!stationData[station]){
        stationData[station] = new CircularBuffer(10);
      }

      stationData[station].add(distance);
  };


  function getDistance(station){
    return 50;
  }

  function average(arr){
    return _.reduce(arr, function(memo, num){
      return memo + num;
    },0) / arr.length;
  }

  this.getData = function(){
      var d = [];
      var stationKeys = Object.keys(stationData);

      for(var i = 0; i < stationKeys.length; i++){
        var key = stationKeys[i];
        var positionData = stationData[key].getData();
        var a = average(positionData);
        d.push({s:key, d:a});
      }

      return d;
  };
}