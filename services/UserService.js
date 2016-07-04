var mongoose = require('mongoose');
var User = mongoose.model('User');
var ResponseBuilder = require('../util/ResponseBuilder.js')
var ObjectUtil = require('../util/ObjectUtil.js')

var UserService = function(){}
var objectUtil = new ObjectUtil();
var responseBuilder = new ResponseBuilder();

//create user
UserService.prototype.createUser = function(req, res){
  var user = req.body;
  var newUser = new User(user);
  logger.info('[INFO] - received create user request::' + newUser );
  if(mongoose.connection.readyState){
    newUser.save(function(error){
      if(error){
        responseBuilder.buildResponseWithError(res, error);
      }else{
        responseBuilder.buildResponse(res, 200);
      }
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

//get users by first name or last name
UserService.prototype.getUsers = function(req, res){
  var searchString = new RegExp(req.params.searchString, 'i');
  logger.info('[INFO] - search keywords'+ searchString);

  if(mongoose.connection.readyState){
    User.find({})
    .where({$or:[{firstName:{$regex:searchString}},
                 {lastName:{$regex:searchString}}]
           })
    .select('userId firstName lastName')
    .limit(10)
    .exec()
    .then(function(users){
      logger.info('[INFO] - found users::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    })
    .catch(function(error){
      responseBuilder.buildResponseWithError(res, error); return;
    });

  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

//get user by _id
UserService.prototype.getUser = function(req, res){
  var userId = req.params.userId;
  logger.info('[INFO] - received get user for id::' + userId);

  if(mongoose.connection.readyState){
    User.findOne({_id:userId})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res, error);return;
      }else{
        if(user){
          logger.info('returning user::' + JSON.stringify(user))
          responseBuilder.buildResponse(res, 200, {success:true, data:user});
        }else{
          responseBuilder.buildResponse(res, 204, {success:false});
        }
      }
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

//authenticate user
UserService.prototype.authenticateUser = function(req, res){
  var userId = req.params.userId;
  var password = req.params.password;

  logger.info('[INFO] - received authenticate user for id::' + userId);
  if(mongoose.connection.readyState){
    User.findOne({userId: userId, password: password})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res, error);return;
      }else{
        if(user){
          responseBuilder.buildResponse(res, 200, {success:true, data:user});
        }else{
          responseBuilder.buildResponse(res, 401, {sucess:false,
            errors:[{errorCode:"AUTHENTICATION_ERROR",
            errorMessage:"user not found"}]});
        }
      }
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
            errors:[{errorCode:"DB_ERROR",
            errorMessage:"database is unavailable"}]});
  }
}

//update user location
UserService.prototype.updateLocation = function(req, res){
  var userId = req.params.userId;
  logger.info('[INFO] - received update location request for user::'
              + userId +" with location::" + JSON.stringify(req.body));

  if(! req.body.latitude || ! req.body.longitude){
    responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR",
        errorMessage:"please provide values for [latitude] and [longitude]"}]});

    return;
  }

  if(mongoose.connection.readyState){
    User.update({_id:userId},
                {$set:{lastKnownLatitude: req.body.latitude,
                       lastKnownLongitude: req.body.longitude}})
    .exec(function(error){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }else{
        responseBuilder.buildResponse(res, 200);
      }
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*add friend*/
UserService.prototype.addFriend = function(req, res){
  var source = mongoose.Types.ObjectId(req.params.source);
  var target = mongoose.Types.ObjectId(req.params.target);

  User.update({$and:[{_id:source},
              {_id:{$ne:target}}]},
              {$addToSet:{friends:target}})
  .exec(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res,error); return;
      }
      logger.info('[INFO] - added friend to ::' + JSON.stringify(user));
      responseBuilder.buildResponse(res, 200, {success:true});
    });
}


/*get friends*/
UserService.prototype.getFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);
  var lastUserId = objectUtil.isStringObjectId(req.query.lastUserId)
                   ? mongoose.Types.ObjectId(req.query.lastUserId)
                   : null;

  var limit = objectUtil.isNumberInt(+req.query.limit) ? +req.query.limit : 20;

  logger.info('[INFO] - limiting response to:' + limit);
  logger.info('[INFO] - last user id:' + JSON.stringify(lastUserId));

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      responseBuilder.buildResponseWithError(res, error); return;
    }

    if(!user){
      responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR",
        errorMessage:"invalid user::"+ userId}]});

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
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('[INFO] - found pending relationships::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

UserService.prototype.getFriendRequests = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      responseBuilder.buildResponseWithError(res, error); return;
    }

    if(!user){
      responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR",
        errorMessage:"invalid user::"+ userId}]});

      return;
    }

    var friends = user.friends;
    User.find({$and:[{_id:{$in:friends}},
              {friends:{$nin:[userId]}}]})
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('[INFO] - found friend requests::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

UserService.prototype.getFriendInvitations = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      responseBuilder.buildResponseWithError(res, error); return;
    }

    if(!user){
      responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR",
        errorMessage:"invalid user::"+ userId}]});

      return;
    }

    var friends = user.friends;
    User.find({$and:[{_id:{$nin:friends}}, {friends:userId}]})
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('[INFO] - found pending friend invitations::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

UserService.prototype.searchFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);
  var searchString = new RegExp(req.params.searchString, 'i');
  logger.info('[INFO] - search string:' + searchString);

  User.findOne({_id:userId})
  .select('friends')
  .exec(function(error, user){
    if(error){
      responseBuilder.buildResponseWithError(res, error); return;
    }

    if(!user){
      responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR",
        errorMessage:"invalid user::"+ userId}]});
      return;
    }

    var friends = user.friends;
    User.find({$and:[{_id:{$in:friends}}, {friends:userId}]})
    .where({$or:[ {firstName:{$regex:searchString}},
                  {lastName:{$regex:searchString}}
                ]
           })
    .select('userId firstName lastName')
    .limit(10)
    .exec(function(error, users){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('[INFO] - found pending relationships::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

UserService.prototype.checkFriend = function(){
  var source = mongoose.Types.ObjectId(req.params.source);
  var target = mongoose.Types.ObjectId(req.params.target);

  User.find({$and:[{_id:source}, {friends:target}]})
  .select('userId')
  .exec(function(error, user){
    if(user){
      responseBuilder.buildResponse(res, 200, {data: true})
    }else{
      responseBuilder.buildResponse(res, 200, {data: false})
    }
  });
}

module.exports = UserService;
