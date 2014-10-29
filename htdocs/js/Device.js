function Device(name, uuid, color) {
  var stationData = {};
  this.name = name;

  this.uuid = uuid;

  this.color = color;


  this.updateData = function(station, distance){
      if(!stationData[station]){
        stationData[station] = new CircularBuffer(10);
      }

      stationData[station].add({d:distance, t: new Date()});
  };

  function average(arr){
    return _.reduce(arr, function(memo, num){
      return memo + num;
    },0) / arr.length;
  }

  this.getData = function(){
      var d = [];

      for(station in stationData){

        var positionData = stationData[station].getData();

        var currentTime = new Date();
        var last5Seconds = _.filter(positionData, function(positionObject){ return ((currentTime - positionObject.t) < 5000); });
        var distances = _.pluck(last5Seconds,'d');

        var a = average(distances);

        d.push({s:station, d:a});
      }

      return d;
  };
}