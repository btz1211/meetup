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

  if(mongoose.connection.readyState){
    Meetuper.find({user:id}, 'meetup').populate('meetup')
    .exec(function(error, meetupers){
      if(error){
        buildResponseWithError(res, error);
      }else{
        if(meetupers){
          console.log("[INFO] - meetups::" + JSON.stringify(meetupers));

          //map the returned array to contain only meetup data
          var meetups = meetupers.map(function(meetuper){
            var meetup = {};
            meetup = meetuper.meetup;
            return meetup;
          });

          buildResponse(res, 200, {success:true, data:meetups});
        }else{
          buildResponse(res, 204, {success:false});
        }
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

//get meetup
module.exports.getMeetup = function(req, res){
  var meetupId = req.params.meetupId;

  if(mongoose.connection.readyState){
    Meetup.findOne({_id:meetupId}).lean().exec(function(error, meetup){
      if(error){
        buildResponseWithError(res, error);return;
      }
      if(meetup){
        Meetuper.find({meetup:meetupId}, 'user status modifiedDate')
        .populate({path:'user', select: 'userId firstName lastName lastKnownLatitude lastKnownLongitude'})
        .exec(function(error, meetupers){
          if(error){
            buildResponseWithError(res, error);return;
          };
          meetup.meetupers = meetupers;
          buildResponse(res, 200, {success:true, data:meetup});
        });
      }else{
        buildResponse(res, 204, {success:false});
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
      }else{

        //create owner as the first meetuper
        var owner = new Meetuper();
        owner.user = meetup.owner;
        owner.meetup = meetup._id;
        owner.status = "INPROGRESS";
        owner.save(function(error){
          if(error){
            buildResponseWithError(res, error);
          }else{
            buildResponse(res, 200);
          }
        });
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

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

//get user by user ID
module.exports.getUser = function(req, res){
  var userId = req.params.userId;
  console.log('[INFO] - received get user for id::' + userId);
  if(mongoose.connection.readyState){
    User.findOne({userId:userId}, 'userId firstName lastName createDate', function(error, user){
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
    User.findOne({userId: userId, password: password}, 'userId firstName lastName createDate',function(error, user){
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

module.exports.searchUsers = function(req, res){
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

module.exports.updateLocation = function(req, res){
  var userId = req.params.userId;
  console.log('[INFO] - received update location request for user::'+ userId +" with location::" + JSON.stringify(req.body));

  if(! req.body.latitude || ! req.body.longitude){
    buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"please provide values for [latitude] and [longitude]"}]});
    return;
  }
  if(mongoose.connection.readyState){
    User.findOne({_id: userId}, function(error, user){
      if(error){
        buildResponseWithError(res, error); return;
      }else{
        if(user){
          user.lastKnownLatitude = req.body.latitude;
          user.lastKnownLongitude = req.body.longitude;
          user.save(function(error){
            if(error){
              buildResponseWithError(res, error); return;
            }else{
              buildResponse(res, 200);
            }
          });
        }else{
          buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid user"}]});
          return;
        }
      }
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*-------------------meetupers--------------------*/
module.exports.createMeetupers = function(req, res){
  var meetupId = req.body.meetup;
  var meetuperIds = req.body.meetuper;

  //convert meetuperIds to array, if its not
  if(! Array.isArray(meetuperIds)){
    meetuperIds = [].concat(meetuperIds);
  }

  if(mongoose.connection.readyState){
    //validate meetup
    Meetup.findOne({_id:meetupId}, '_id', function(error, meetup){
      if(error){
        buildResponseWithError(res, error); return;
      }
      if(!meetup){
        buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid meetup"}]});
        return;
      }

      //validate users
      User.find({_id:{$in:meetuperIds}}, '_id', function(error, users){
        if(users == null){ users = [];}

        //convert user array to a hash
        var userHash = {};
        for(var i = 0; i<users.length;++i){
          userHash[users[i]._id] = true;
        }
        console.log('[INFO] users found::' + JSON.stringify(userHash));

        var invalidUsers = [];
        for(var i = 0; i < meetuperIds.length; ++i){
          if(! userHash.hasOwnProperty(meetuperIds[i])){
            invalidUsers.push(meetuperIds[i]);
          }
        }
        if(invalidUsers.length > 0){
          buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid user(s) provided" + JSON.stringify(invalidUsers)}]});
          return;
        }

        //map meetuper to proper object for persistence
        var meetupers = users.map(function(user){
          var meetuper = {};
          meetuper.user = user._id;
          meetuper.meetup = mongoose.Types.ObjectId(meetupId);
          meetuper.status = "PENDING";
          return meetuper;
        });

        console.log('[INFO] creating meetupers'+JSON.stringify(meetupers));
        Meetuper.collection.insert(meetupers, function(error, meetupers){
          if(error){
            buildResponseWithError(res, error); return;
          }

          buildResponse(res, 200, {success:true});
        });
      });
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}
/*-------------------relationship--------------------*/
//get relationships

//verify friendship
module.exports.verifyFriendship = function(req, res){
  var relationshipId = req.params.relationshipId;
  console.log("received request to update relationship::"+JSON.stringify(relationshipId));

  if(mongoose.connection.readyState){
    Relationship.findOne({_id:relationshipId}, function(error, relationship){
      if(error){
        buildResponseWithError(res, error);return;
      }
      //make sure relationship is still in a good state
      if(!relationship || relationship.status != 'PENDING'){
        buildResponse(res, 400, {success:false, errors:[{errorCode:"INVALID_REQUEST_ERROR",
                  errorMessage:"relationship:"+ relationshipId +" is no longer pending"}]});
        return;
      }

      relationship.status='VERIFIED';
      relationship.save(function(error){
        if(error){
          buildResponseWithError(res, error);return;
        }else{
          buildResponse(res, 200);
        }
      });
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

//get friends
module.exports.getFriends = function(req, res){
  var userId = req.params.userId;
  if(mongoose.connection.readyState){
    User.findOne({_id:userId}, '_id', function(error, user){
      if(error){
        buildResponseWithError(res, error); return;
      }

      if(!user){
        buildResponse(res, 400, {sucess:false, errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:"invalid user id::"+userId}]});
        return;
      }

      console.log('[INFO] - user found::'+JSON.stringify(user));
      var friends = [];

      //get friends who are the source
      Relationship.find({status:'VERIFIED', type:'FRIENDS', $or:[{source:user._id}, {target:user._id}]})
      .select('source target')
      .populate({
        path:'source target',
        select: 'userId firstName lastName dateOfBirth'
      }).exec(function(error, relationships){
        if(error){
          buildResponseWithError(res, error);return;
        }
        console.log('[INFO] - friends found::' + JSON.stringify(relationships) + " for user::"+userId);

        //retrieve only friends
        var friends = relationships.map(function(relationship){
          var friend = {};
          if(userId === relationship.source.id){
            return relationship.target;
          }else{
            return relationship.source;
          }
        });

        buildResponse(res, 200, {success:true, data:friends});
      });
    });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

//create relationships
module.exports.createRelationship = function(req, res){
  var relationship = req.body;
  console.log('[INFO] - received create relationship request::' + JSON.stringify(relationship));

  //fail if the source equals the target
  if(relationship.source && relationship.source === relationship.target){
    buildResponse(res, 400, {sucess:false, errors:[{errorCode:"INVALID_REQUEST_ERROR",
      errorMessage:"source user cannot be the same as the target user!" }]});
    return;
  }

  if(mongoose.connection.readyState){
      User.find({$or:[{_id:relationship.source}, {_id:relationship.target}]}, '_id', function(error, users){
        if(!users || users.length != 2){
          buildResponse(res, 400, {sucess:false, errors:[{errorCode:"INVALID_REQUEST_ERROR",
            errorMessage:"request contains invalid user" }]});
          return;
        }

        relationship.status = "PENDING";
        //create relationship
        var newRelationship = new Relationship(relationship);
        newRelationship.save(function(error, relationship){
          if(error){
            buildResponseWithError(res, error); return;
          }else{
            buildResponse(res, 200, {data:relationship});
          }
        });
      });
  }else{
    buildResponse(res, 500, {sucess:false, errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
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
