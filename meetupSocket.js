var socketio = require('socket.io');

var MeetupSocket = function(http){
  if(http){
    meetupSocket =  socketio(http);

    meetupSocket.sockets.on('connection', function(socket){
      console.log('meetup connected:' + JSON.stringify(socket.id));

      socket.on('locationUpdate', function(locationInfo){
        socket.emit('locationUpdate', locationInfo);
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
