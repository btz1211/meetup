var mongoose = require('mongoose');
var User = require('./user').model;
var userValidation = require('./user').validation;

var meetupSchema = mongoose.Schema({
  name: {type: String, required: '{PATH} is required' },
  address: {type: String, required: '{PATH} is required' },
  longitude: {type:Number, min: [-180, 'the minimum value for {PATH} is -180'], max: [180, 'the maximum value for {PATH} is 180'], required: '{PATH} is required'},
  latitude: {type:Number, min: [-90, 'the minimum value for {PATH} is -90'], max: [90, 'the maximum value for {PATH} is 90'], required: '{PATH} is required' },
  startTime: {type:Date, required: '{PATH} is required'},
  endTime: {type:Date, required: '{PATH} is required'},
  status: {type: String, enum:["INPROGRESS", "CANCELLED", "COMPLETED"], default:"INPROGRESS", required: '{PATH} is required' },
  owner:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:'{PATH} is required'},
  createDate:{ type:Date, default: Date.now },
  modifiedDate: { type:Date, default: Date.now },
});

//additional validation for owner
meetupSchema.path('owner').validate(userValidation, 'owner[{VALUE}] is an invalid user');
var meetupModel = mongoose.model('Meetup', meetupSchema);

module.exports.schema = meetupSchema;
module.exports.model = meetupModel;
module.exports.validation = function(value, respond){
  console.log('meetup validation for::'+value);
  meetupModel.findOne({_id:value, status:"INPROGRESS"}, function(error, meetup){
    if(error || !meetup){
      respond(false);
    }else{
      respond(true);
    }
  });
};
