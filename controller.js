var fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');
var Meetuper = mongoose.model('Meetuper')
var Relationship = mongoose.model('Relationship');

/*-------------------meetup--------------------*/
//get user's meetups
module.exports.getMeetups = function(req, res){
  var id = mongoose.Types.ObjectId(req.params.userId);
  console.log('[INFO] - received request for user id::' + id);

  Meetup.find({'meetupers.user':req.params.userId})
  .select('name address status owner startTime endTime latitude longitude')
  .exec(function(error, meetups){
    if(meetups && meetups.length > 0){
      console.log("[INFO] - meetups::" + JSON.stringify(meetups));
      buildResponse(res, 200, {success:true, data:meetups});
    }else{
      buildResponse(res, 204, {success:false});
    }
  });
};

//get meetup
module.exports.getMeetup = function(req, res){
  var meetupId = req.params.meetupId;

  if(mongoose.connection.readyState){
    Meetup.findOne({_id:meetupId})
    .exec(function(error, meetup){
      if(error){
        buildResponseWithError(res, error);return;
      }
      if(!meetup){
        buildResponse(res, 204, {success:false});
      }else{
        buildResponse(res, 200, {success:true, data:meetup});
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*create meetup*/
module.exports.createMeetup = function(req, res){
  var meetup = req.body;

  if(mongoose.connection.readyState){
    meetup.status="INPROGRESS";
    var newMeetup = new Meetup(meetup);
    console.log('[INFO] - creating meetup::'+ JSON.stringify(meetup));

    //save meetup
    newMeetup.save(function(error, meetup){
      if(error){
        buildResponseWithError(res, error); return;
      }
      buildResponse(res, 200, {data:meetup});
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

/*add meetupers*/
module.exports.addMeetupers = function(req, res){
  var meetupId = req.params.meetupId;

  if(mongoose.connection.readyState){
    Meetup.findOne({_id: meetupId}, '_id')
    .exec(function(error, meetup){
      if(error){
        buildResponseWithError(res, error); return;
      }

      console.log('[INFO] - meetup found::' + JSON.stringify(meetup));
      if(!meetup){
        buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid meetup: " + meetupId}]}); return;
      }

      meetuperIds = [].concat(req.body.meetuper);
      User.find({_id:{$in:meetuperIds}})
      .select('_id')
      .exec(function(error, users){
        if(error){
          buildResponseWithError(res, error); return;
        }
        if(!users || (users.length != meetuperIds.length)){
          buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"request contains invalid user(s)"}]});
          return;
        }

        //map meetuper to proper object for persistence
        var meetupers = users.map(function(user){
          return new Meetuper({user:user._id});
        });
        console.log('[INFO] creating meetupers'+JSON.stringify(meetupers));

        Meetup.update({_id: meetupId, 'meetupers.user':{$nin: meetuperIds} }, {$push: {meetupers: {$each: meetupers}}})
        .exec(function(error, updatedObjects){
          if(error){
            buildResponseWithError(res, error); return;
          }

          console.log('[INFO] - updated::' + JSON.stringify(updatedObjects));
          buildResponse(res, 200, {success:true});
        });
      });
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*-------------------user--------------------*/
module.exports.createUser = function(req, res){
  var user = req.body;
  var newUser = new User(user);
  console.log('[INFO] - received create user request::' + newUser );
  if(mongoose.connection.readyState){
    newUser.save(function(error){
      if(error){
        buildResponseWithError(res, error);
      }else{
        buildResponse(res, 200);
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

/*get users by search string*/
module.exports.getUsers = function(req, res){
  var searchString = req.params.searchString;
  console.log('[INFO] - search keywords'+ searchString);

  if(mongoose.connection.readyState){
    User.find({$text: {$search: searchString, $caseSensitive:false}})
    .select('id userId firstName lastName')
    .exec(function(error, users){
      if(error){
        buildResponseWithError(res, error); return;
      }

      if(!users){
        buildResponse(res, 204, {success:false});
      }else{
        buildResponse(res, 200, {success:true, data:users});
      }
    })
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*get user by user ID*/
module.exports.getUser = function(req, res){
  var userId = req.params.userId;
  console.log('[INFO] - received get user for id::' + userId);
  if(mongoose.connection.readyState){
    User.findOne({userId:userId})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        buildResponseWithError(res, error);return;
      }else{
        if(user){
          buildResponse(res, 200, {success:true, data:user});
        }else{
          buildResponse(res, 204, {success:false});
        }
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

//authenticate user
module.exports.authenticateUser = function(req, res){
  var userId = req.params.userId;
  var password = req.params.password;
  console.log('[INFO] - received authenticate user for id::' + userId);
  if(mongoose.connection.readyState){
    User.findOne({userId: userId, password: password})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        buildResponseWithError(res, error);return;
      }else{
        if(user){
          buildResponse(res, 200, {success:true, data:user});
        }else{
          buildResponse(res, 401, {sucess:false, errors:[{errorCode:"AUTHENTICATION_ERROR", errorMessage:"user not found"}]});
        }
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

/*Update user location*/
module.exports.updateLocation = function(req, res){
  var userId = req.params.userId;
  console.log('[INFO] - received update location request for user::'+ userId +" with location::" + JSON.stringify(req.body));

  if(! req.body.latitude || ! req.body.longitude){
    buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"please provide values for [latitude] and [longitude]"}]});
    return;
  }
  if(mongoose.connection.readyState){
    User.update({_id:userId}, {$set:{lastKnownLatitude: req.body.latitude, lastKnownLongitude: req.body.longitude}}, function(error){
      if(error){
        buildResponseWithError(res, error); return;
      }else{
        buildResponse(res, 200);
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*add friend*/
module.exports.addFriend = function(req, res){
  var source = mongoose.Types.ObjectId(req.params.source);
  var target = mongoose.Types.ObjectId(req.params.target);

  User.update({$and:[{_id:source}, {_id:{$ne:target}}]}, {$addToSet:{friends:target}},
    function(error, user){
      if(error){
        buildResponseWithError(res,error); return;
      }
      console.log('[INFO] - added friend to ::' + JSON.stringify(user));
      buildResponse(res, 200, {success:true});
    });
}


/*get friends*/
module.exports.getFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      buildResponseWithError(res, error); return;
    }

    if(!user){
      buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid user::"+ userId}]});
      return;
    }

    var friends = user.friends;
    User.find({$and:[{_id:{$in:friends}}, {friends:userId}]})
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        buildResponseWithError(res, error); return;
      }
      console.log('[INFO] - found pending relationships::' + JSON.stringify(users));
      buildResponse(res, 200, {data:users});
    });
  });
}

module.exports.getPendingFriendships = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      buildResponseWithError(res, error); return;
    }

    if(!user){
      buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid user::"+ userId}]});
      return;
    }

    var friends = user.friends;
    User.find({$and:[{_id:{$nin:friends}}, {friends:userId}]})
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        buildResponseWithError(res, error); return;
      }
      console.log('[INFO] - found pending relationships::' + JSON.stringify(users));
      buildResponse(res, 200, {data:users});
    });
  });
}

/*-------------------utilties function (move later)--------------------*/
var buildResponseWithError = function(res, error){
  console.log("error::"+ JSON.stringify(error));

  var errors = [];
  if(error.name){
    switch(error.name){
      case 'ValidationError':
        for(field in error.errors){
          errors.push({errorCode:"VALIDATION_ERROR", field:field, errorMessage:error.errors[field].message});
        }
        buildResponse(res, 400, {success:false, errors:errors});
        break;
      case 'CastError':
        errors.push({errorCode:"VALIDATION_ERROR", errorMessage:"parameter value ["+error.value+"] is invalid, expected type:"+error.kind})
        buildResponse(res, 400, {success:false, errors:errors});
        break;
      case 'MongoError':
        switch(error.code){
          case 11000:
            errors.push({errorCode:"DUPLICATION_ERROR", errorMessage:error.errmsg});
            buildResponse(res, 409, {success:false, errors:errors});
            break;
          default:
            errors.push({errorCode:"DB_ERROR", errorMessage:"db error occurred::" + error.errmsg});
            buildResponse(res, 500, {success:false, errors:errors});
        }
        break;
      default:
        errors.push({errorCode:error.name, errorMessage:error.message});
        buildResponse(res, 500, {success:false, errors:errors});
    }
  }
}

var buildResponse = function(res, statusCode, statusMessage){
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode);
  res.send(statusMessage);
}
