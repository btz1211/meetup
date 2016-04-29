var fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');
var Meetuper = mongoose.model('Meetuper')
var Relationship = mongoose.model('Relationship');

/*-------------------meetup--------------------*/
//get user's meetups
module.exports.getMeetups = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);
  console.log('[INFO] - received request for user id::' + userId);

  Meetup.find({$or:[{meetupers:userId}, {owner:userId}]})
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
    .select('_id name address owner startTime endTime latitude longitude status')
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

module.exports.updateMeetup = function(req, res){
  var meetup = req.body;
  var meetupId = req.params.meetupId;
  console.log('[INFO] - updating meetup::' + JSON.stringify(meetup));

  if(mongoose.connection.readyState){
    Meetup.findById(meetupId).select('_id').exec()
    //meetup found
    .then(function(meetupInDb){
      if(! meetupInDb){ throw 'invalid meetup id::' + meetupId; }
      return Meetup.update({_id:meetupId}, {$set:{name:meetup.name, latitude:meetup.latitude, longitude:meetup.longitude,
        address:meetup.address, startTime:meetup.startTime, endTime:meetup.endTime, status:meetup.status}}).exec();
    })
    //meetup updated
    .then(function(result){
      console.log('[INFO] - meetup updated::'+JSON.stringify(result));
      buildResponse(res, 200, {success:true});
    })
    //process error
    .catch(function(error){
      console.log('[ERROR] - error found::' + JSON.stringify(error));
      buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:error}]});
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

module.exports.getMeetupers = function(req, res){
  var meetupId = req.params.meetupId;
  if(isStringObjectId(meetupId)){
    meetupId = mongoose.Types.ObjectId(req.params.meetupId);
  }else{
    buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid meetup id: " + meetupId}]});
    return;
  }

  if(mongoose.connection.readyState){
    Meetup.aggregate([
      {$match:{_id:meetupId}},
    	{$unwind:"$meetupers"},
    	{$project:{user:"$meetupers.user", status:"$meetupers.status", _id:0}},
    	{$lookup:{from:"users", localField:"user", foreignField:"_id", as:"user"}},
    	{$unwind:"$user"},
    	{$project:{_id:"$user._id", userId:"$user.userId", firstName:"$user.firstName", lastName:"$user.lastName",
    		lastKnownLatitude:"$user.lastKnownLatitude", lastKnownLongitude:"$user.lastKnownLongitude", status:1}}
    ]).exec(function(error, meetupers){
      if(error){
        buildResponseWithError(res, error); return;
      }

      //console.log('[INFO] - meetupers found::' + JSON.stringify(meetupers));
      buildResponse(res, 200, {data:meetupers});
    })
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*add meetupers*/
module.exports.addMeetuper = function(req, res){
  var meetupId = mongoose.Types.ObjectId(req.params.meetupId);
  var meetuperId = mongoose.Types.ObjectId(req.params.meetuperId);
  if(mongoose.connection.readyState){
      console.log('[INFO] - adding meetuper::' + meetuperId + ' to meetup::' + meetupId);

      Meetup.findById(meetupId).select('_id').exec()
      //meetup found
      .then(function(meetup){
        if(! meetup){ throw 'invalid meetup id::' + meetupId; }
        return User.findById(meetuperId).select('_id').exec();
      })
      //user found
      .then(function(user){
        if(!user){ throw 'invalid meetuper id::' + meetuperId; }
        var meetuper = new Meetuper({user:user._id});
        return Meetup.update({$and:[{_id: meetupId},{'meetupers.user':{$ne:meetuperId}}]} , {$push: {meetupers:meetuper}}).exec();
      })
      //update meetup
      .then(function(meetup){
        buildResponse(res, 200, {success:true});
      })
      //process error
      .catch(function(error){
        buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:error}]});
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
  var lastUserId = isStringObjectId(req.query.lastUserId) ? mongoose.Types.ObjectId(req.query.lastUserId) : null;
  var limit = isNumberInt(+req.query.limit) ? +req.query.limit : 20;
  console.log('[INFO] - limiting response to:' + limit);
  console.log('[INFO] - last user id:' + JSON.stringify(lastUserId));

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
    var query = User.find({$and:[{_id:{$in:friends}}, {friends:userId}]});

    if(lastUserId){
      query = query.where({_id:{$gt:lastUserId}});
    }
    query.select('userId firstName lastName')
    .limit(limit)
    .exec(function(error, users){
      if(error){
        buildResponseWithError(res, error); return;
      }
      console.log('[INFO] - found pending relationships::' + JSON.stringify(users));
      buildResponse(res, 200, {data:users});
    });
  });
}

module.exports.getFriendRequests = function(req, res){
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
    User.find({$and:[{_id:{$in:friends}}, {friends:{$nin:[userId]}}]})
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        buildResponseWithError(res, error); return;
      }
      console.log('[INFO] - found friend requests::' + JSON.stringify(users));
      buildResponse(res, 200, {data:users});
    });
  });
}

module.exports.getFriendInvitations = function(req, res){
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
      console.log('[INFO] - found pending friend invitations::' + JSON.stringify(users));
      buildResponse(res, 200, {data:users});
    });
  });
}

module.exports.searchFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);
  var searchString = new RegExp(req.params.searchString, 'i');
  console.log('[INFO] - search string:' + searchString);

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
    .where({$or:[{firstName:{$regex:searchString}}, {lastName:{$regex:searchString}}]})
    .select('userId firstName lastName')
    .limit(10)
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

var isNumberInt = function(number){
    return number === +number && number === (number|0);
}

var isStringObjectId = function(string){
    if(mongoose.Types.ObjectId.isValid(string)){
      var convertedObjectId = new mongoose.Types.ObjectId(string);
      console.log("[INFO] - converted object id:" + convertedObjectId.toString());
      return string === convertedObjectId.toString();
    }else{
      return false;
    }
}
