var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
  userId: {type:String, required:'{PATH} is required'},
  password: {type:String, required:'{PATH} is required'},
  firstName: {type:String, required:'{PATH} is required'},
  lastName: {type:String, required:'{PATH} is required'},
  dateOfBirth: Date,
  lastKnownLatitude: {type:Number, min: [-90, 'the minimum value for {PATH} is -90'], max: [90, 'the maximum value for {PATH} is 90']},
  lastKnownLongitude: {type:Number, min: [-180, 'the minimum value for {PATH} is -180'], max: [180, 'the maximum value for {PATH} is 180']},
  createDate: { type:Date, default: Date.now },
  modifiedDate: { type:Date, default: Date.now },
  friends:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}]
});
var userModel = mongoose.model('User', userSchema);
var userValidation  = function(value, respond){
  userModel.findOne({_id:value}, function(error, user){
    if(error || !user){
      respond(false);
    }else{
      respond(true);
    }
  });
};

module.exports.schema = userSchema;
module.exports.model = userModel;
module.exports.validation = userValidation;
