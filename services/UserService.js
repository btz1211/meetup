var mongoose = require('mongoose');
var ResponseBuilder = require('../util/ResponseBuilder.js')
var ObjectUtil = require('../util/ObjectUtil.js')
var logger = require('../logger')
require('../models/user');
require('../models/meetup');

var UserService = function(){}

var objectUtil = new ObjectUtil();
var responseBuilder = new ResponseBuilder();
var User = mongoose.model('User');

//create user
UserService.prototype.createUser = function(req, res){
  var user = req.body;
  var newUser = new User(user);
  logger.debug('received create user request::' + newUser );
  if(mongoose.connection.readyState){
    newUser.save(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res, error);
      }else{
        userJson = user.toObject();
        delete userJson.password;
        responseBuilder.buildResponse(res, 200, {data: userJson});
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
  logger.debug('search keywords'+ searchString);

  if(mongoose.connection.readyState){
    User.find({})
    .where({$or:[{firstName:{$regex:searchString}},
                 {lastName:{$regex:searchString}}]
           })
    .select('userId firstName lastName')
    .limit(10)
    .exec()
    .then(function(users){
      logger.debug('found users::' + JSON.stringify(users));
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
UserService.prototype.getUserById = function(req, res){
  var id = req.params.id;
  logger.debug('received get user for id::' + id);

  if(mongoose.connection.readyState){
    User.findOne({_id:id})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res, error);return;
      }else{
        if(user){
          logger.debug('returning user::' + JSON.stringify(user))
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

//get user by username
UserService.prototype.getUserByUsername = function(req, res){
  var username = req.params.username;
  logger.debug('received get user for username::' + username);

  if(mongoose.connection.readyState){
    User.findOne({userId:username})
    .select('userId firstName lastName createDate')
    .exec(function(error, user){
      if(error){
        responseBuilder.buildResponseWithError(res, error);return;
      }else{
        if(user){
          logger.debug('returning user::' + JSON.stringify(user))
          responseBuilder.buildResponse(res, 200, {success:true, data:user});
        }else{
          responseBuilder.buildResponse(res, 404, {success:false});
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

  logger.debug('received authenticate user for id::' + userId);
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
  logger.debug('received update location request for user::'
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
                       lastKnownLongitude: req.body.longitude}},
                {runValidators: true})
    .exec(function(error, result){
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

module.exports = UserService;
