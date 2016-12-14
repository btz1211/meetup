var socketio = require('socket.io');

var MeetupSocket = function(http){
  if(http){
    meetupSocket =  socketio(http);

    meetupSocket.sockets.on('connection', function(socket){
      console.log("socket connected:" + socket.id)

      socket.on('locationUpdate', function(locationInfo){
        console.log("location update: [" + locationInfo.latitude + "," + locationInfo.longitude +
                    "] received from: " + locationInfo.user);

        meetupSocket.sockets.emit('locationUpdate', locationInfo);
      });

      socket.on('userLive', function(meetuper){
        console.log(meetuper.firstName + " " + meetuper.lastName + " is live");
        socket.broadcast.emit('userLive', meetuper);
      });

      socket.on('disconnect', function() {
         console.log('socket disconnected ' + socket.id);
      });
    });

    MeetupSocket.prototype.socket = meetupSocket;
  }
};


MeetupSocket.prototype.broadcastUserLocationUpdate = function(user, meetupIds){
  for(var meetupId in meetupIds){
    MeetupSocket.prototype.socket.emit(meetupId, user);
  }
}

MeetupSocket.prototype.instantiate = function(http){

}

MeetupSocket.prototype.getSocket = function(){
  return MeetupSocket.prototype.socket;
}

module.exports = MeetupSocket;
