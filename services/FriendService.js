var mongoose = require('mongoose');
var ResponseBuilder = require('../util/ResponseBuilder.js')
var ObjectUtil = require('../util/ObjectUtil.js')
var logger = require('../logger')
require('../models/user');
require('../models/meetup');

var FriendService = function(){}

var objectUtil = new ObjectUtil();
var responseBuilder = new ResponseBuilder();
var User = mongoose.model('User');

/*add friend*/
FriendService.prototype.addFriend = function(req, res){
  var source = mongoose.Types.ObjectId(req.params.source);
  var target = mongoose.Types.ObjectId(req.params.target);

  User.update({$and:[{_id:source},
              {_id:{$ne:target}}]},
              {$addToSet:{friends:target}})
  .exec(function(error, response){
      if(error && ! response.result.nModified){
        responseBuilder.buildResponseWithError(res,error); return;
      }
      responseBuilder.buildResponse(res, 200, {success: true});
    });
}


/*get friends*/
FriendService.prototype.getFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  var lastUserId = objectUtil.isStringObjectId(req.query.lastUserId)
                   ? mongoose.Types.ObjectId(req.query.lastUserId)
                   : null;

  var limit = objectUtil.isNumberInt(+req.query.limit) ? +req.query.limit : 20;

  logger.info('limiting response to:' + limit);
  logger.info('last user id:' + JSON.stringify(lastUserId));

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

    logger.info('friend::' + JSON.stringify(friends));
    if(lastUserId){
      query = query.where({_id:{$gt:lastUserId}});
    }

    query.select('userId firstName lastName')
    .limit(limit)
    .exec(function(error, users){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('found pending relationships::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

FriendService.prototype.getFriendRequests = function(req, res){
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
    User.find({$and:[{ _id:{ $in:friends } },
                     { friends:{ $nin:[userId] } }
                    ]
              })
    .select('userId firstName lastName')
    .exec(function(error, users){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      logger.info('found friend requests::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

FriendService.prototype.getFriendInvitations = function(req, res){
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
      logger.info('found pending friend invitations::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

FriendService.prototype.searchFriends = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);
  var searchString = new RegExp(req.params.searchString, 'i');
  logger.info('search string:' + searchString);

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
      logger.info('found pending relationships::' + JSON.stringify(users));
      responseBuilder.buildResponse(res, 200, {data:users});
    });
  });
}

module.exports = FriendService;
