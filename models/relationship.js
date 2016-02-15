var mongoose = require('mongoose');
var userValidation = require('./user').validation;
var relationshipSchema = mongoose.Schema({
  type: {type: String, required: '{PATH} is required'},
  source: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required:'{PATH} is required'},
  target: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required:'{PATH} is required'},
  status: {type: String, enum:["PENDING", "VERIFIED", "ONHOLD"], default: "PENDING"},
  createDate: { type:Date, default: Date.now },
  modifiedDate:{ type:Date, default: Date.now },
})

relationshipSchema.path('source').validate(userValidation, 'source user:{VALUE} is an invalid user');
relationshipSchema.path('target').validate(userValidation, 'target user:{VALUE} is an invalid user');

var relationshipModel = mongoose.model('Relationship', relationshipSchema);
module.exports.schema = relationshipSchema;
module.exports.model = relationshipModel;
