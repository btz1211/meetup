var logger = require('../logger');
var RequestError = require('../errors/RequestError');
var ResponseBuilder = function(){}

ResponseBuilder.prototype.buildResponse = function(res, statusCode, statusMessage){
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode);
  res.send(JSON.stringify(statusMessage));
}

ResponseBuilder.prototype.buildResponseWithError = function(res, error){
  var responseBuilder = this;
  logger.info("error::"+JSON.stringify(error));

  var errorCode;
  var errors = [];
  switch(error.name){
    case 'RequestError':
      errorCode = error.code;
      errors.push(error.message);
      break;
    case 'ValidationError':
      errorCode = 400;
      errors = this.parseMongooseValidationError(error);
      break;

    case 'CastError':
      errorCode = 400;
      errors.push(this.parseMongooseCastError(error));
      break;

    case 'MongoError':
      errorCode = 400;
      errors.push(this.parseMongoError(error));
      break;

    default:
      errorCode = 500;
      errors.push({errorCode:error.name, errorMessage:error.message});
  }

  responseBuilder.buildResponse(res, errorCode, {success:false, errors:errors});
}

ResponseBuilder.prototype.parseMongoError = function(mongoError){
  switch(mongoError.code){
    case 11000:
      return {errorCode:"DUPLICATION_ERROR", errorMessage:mongoError.errmsg};
    default:
      return {errorCode:"DB_ERROR",errorMessage:"db error occurred::" + mongoError.errmsg};
  }
}

ResponseBuilder.prototype.parseMongooseValidationError = function(validationError){
  var errors = [];
  for(field in validationError.errors){
    errors.push({errorCode:"VALIDATION_ERROR",
                 field:field,
                 errorMessage:validationError.errors[field].message});
  }
  return errors;
}

ResponseBuilder.prototype.parseMongooseCastError = function(castError){
  return {errorCode:"VALIDATION_ERROR",
          errorMessage:"parameter value [" + castError.value + "] "
                      +"is invalid, expected type:"+castError.kind};
}

module.exports = ResponseBuilder;
