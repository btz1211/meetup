var mongoose = require('mongoose');
var userValidation = require('./user').validation;

var meetuperSchema = mongoose.Schema({
  user:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:'{PATH} is required'},
  status:{type:String, enum:["PENDING", "INPROGRESS", "CANCELLED", "COMPLETED"], default:'PENDING', required:'{PATH} is required'},
  modifiedDate:{ type:Date, default: Date.now}
}, {_id:false});

meetuperSchema.path('user').validate(userValidation, 'invalid user');

var meetuperModel = mongoose.model('Meetuper', meetuperSchema);
module.exports.schema = meetuperSchema;
module.exports.model = meetuperModel;
