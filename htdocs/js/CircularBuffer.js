function CircularBuffer(size){
	var i = 0;
	var dataStore = [];

	this.add = function(data){
		if(i >= size)
			size = 0;
		dataStore[i] = data;
		i++;
	}

	this.getData = function(){
		return dataStore;
	}
}

