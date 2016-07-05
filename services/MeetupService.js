var mongoose = require('mongoose');
var logger = require('../logger')
var Meetup = mongoose.model('Meetup');
var ResponseBuilder = require('../util/ResponseBuilder.js')
var ObjectUtil = require('../util/ObjectUtil.js')

var MeetupService = function(){}
var objectUtil = new ObjectUtil();
var responseBuilder = new ResponseBuilder();

/*get user's meetups*/
MeetupService.prototype.getMeetups = function(req, res){
  var userId = mongoose.Types.ObjectId(req.params.userId);

  Meetup.find({$or:[{'meetupers.user':userId}, {owner:userId}]})
  .select('name address status owner startTime endTime latitude longitude')
  .exec(function(error, meetups){
    if(meetups && meetups.length > 0){
      responseBuilder.buildResponse(res, 200, {success:true, data:meetups});
    }else{
      responseBuilder.buildResponse(res, 204, {success:false});
    }
  });
};

//get meetup
MeetupService.prototype.getMeetup = function(req, res){
  var meetupId = req.params.meetupId;

  if(mongoose.connection.readyState){
    Meetup.findOne({_id:meetupId})
    .select('_id name address owner startTime endTime latitude longitude status')
    .exec(function(error, meetup){
      if(error){
        responseBuilder.buildResponseWithError(res, error);return;
      }
      if(!meetup){
        responseBuilder.buildResponse(res, 204, {success:false});
      }else{
        responseBuilder.buildResponse(res, 200, {success:true, data:meetup});
      }
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*create meetup*/
MeetupService.prototype.createMeetup = function(req, res){
  var meetup = req.body;

  if(mongoose.connection.readyState){
    meetup.status="INPROGRESS";
    var newMeetup = new Meetup(meetup);
    logger.info('creating meetup::'+ JSON.stringify(meetup));

    //save meetup
    newMeetup.save(function(error, meetup){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }
      responseBuilder.buildResponse(res, 200, {data:meetup});
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
};

MeetupService.prototype.updateMeetup = function(req, res){
  var meetup = req.body;
  var meetupId = req.params.meetupId;
  logger.info('updating meetup::' + JSON.stringify(meetup));

  if(mongoose.connection.readyState){
    Meetup.findById(meetupId)
    .select('_id')
    .exec()

    //meetup found
    .then(function(meetupInDb){
      if(! meetupInDb){ throw 'invalid meetup id::' + meetupId; }

      return Meetup.update({_id:meetupId},
                           {$set:{name:meetup.name,
                                  latitude:meetup.latitude,
                                  longitude:meetup.longitude,
                                  address:meetup.address,
                                  startTime:meetup.startTime,
                                  endTime:meetup.endTime,
                                  status:meetup.status}
                            }).exec();
    })

    //meetup updated
    .then(function(result){
      logger.info('meetup updated::'+JSON.stringify(result));
      responseBuilder.buildResponse(res, 200, {success:true});
    })

    //process error
    .catch(function(error){
      logger.info('[ERROR] - error found::' + JSON.stringify(error));
      responseBuilder.buildResponse(res, 400, {success:false,
        errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:error}]});
    });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

MeetupService.prototype.getMeetupers = function(req, res){
  var meetupId = req.params.meetupId;
  if(objectUtil.isStringObjectId(meetupId)){
    meetupId = mongoose.Types.ObjectId(req.params.meetupId);
  }else{
    responseBuilder.buildResponse(res, 400, {success:false,
      errors:[{errorCode:"INVALID_REQUEST_ERROR",
      errorMessage:"invalid meetup id: " + meetupId}]});
    return;
  }

  if(mongoose.connection.readyState){
    Meetup.aggregate([
      {$match:{_id:meetupId}},
    	{$unwind:"$meetupers"},
    	{$project:{user:"$meetupers.user", status:"$meetupers.status", _id:0}},
    	{$lookup:{from:"users", localField:"user", foreignField:"_id", as:"user"}},
    	{$unwind:"$user"},
    	{$project:{ _id:"$user._id",
                 userId:"$user.userId",
                 firstName:"$user.firstName",
                 lastName:"$user.lastName",
    		         lastKnownLatitude:"$user.lastKnownLatitude",
                 lastKnownLongitude:"$user.lastKnownLongitude",
                 status:1}}
    ]).exec(function(error, meetupers){
      if(error){
        responseBuilder.buildResponseWithError(res, error); return;
      }

      //logger.info('meetupers found::' + JSON.stringify(meetupers));
      responseBuilder.buildResponse(res, 200, {data:meetupers});
    })
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}

/*add meetupers*/
MeetupService.prototype.addMeetuper = function(req, res){
  var meetupId = mongoose.Types.ObjectId(req.params.meetupId);
  var meetuperId = mongoose.Types.ObjectId(req.params.meetuperId);
  if(mongoose.connection.readyState){
      logger.info('adding meetuper::' + meetuperId + ' to meetup::' + meetupId);

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
        return Meetup.update({$and:[{_id: meetupId},
                                    {'meetupers.user': {$ne:meetuperId}}
                                   ]},
                             {$push: {meetupers:meetuper}}).exec();
      })
      //update meetup
      .then(function(meetup){
        responseBuilder.buildResponse(res, 200, {success:true});
      })
      //process error
      .catch(function(error){
        responseBuilder.buildResponse(res, 400, {success:false,
          errors:[{errorCode:"INVALID_REQUEST_ERROR", errorMessage:error}]});
      });
  }else{
    responseBuilder.buildResponse(res, 500, {sucess:false,
      errors:[{errorCode:"DB_ERROR", errorMessage:"database is unavailable"}]});
  }
}


module.exports = MeetupService;
