var mongoose = require('mongoose');
var userValidation = require('./user').validation;
var meetupValidation = require('./meetup').validation;

var meetuperSchema = mongoose.Schema({
  user:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:'{PATH} is required'},
  meetup:{type:mongoose.Schema.Types.ObjectId, ref:'Meetup', required:'{PATH} is required'},
  status:{type:String, enum:["PENDING", "INPROGRESS", "CANCELLED", "COMPLETED"], required:'{PATH} is required'},
  modifiedDate:{ type:Date, default: Date.now}
});

meetuperSchema.path('user').validate(userValidation, 'invalid user');
meetuperSchema.path('meetup').validate(meetupValidation, 'invalid meetup, please make sure the meetup is in progress');

var meetuperModel = mongoose.model('Meetuper', meetuperSchema);
module.exports.schema = meetuperSchema;
module.exports.model = meetuperModel;
