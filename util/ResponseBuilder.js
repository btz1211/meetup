var ResponseBuilder = function(){}

ResponseBuilder.prototype.buildResponse = function(res, statusCode, statusMessage){
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode);
  res.send(statusMessage);
}

ResponseBuilder.prototype.buildResponseWithError = function(res, error){
  var responseBuilder = this;
  console.log("error::"+ JSON.stringify(error));

  var errors = [];
  if(error.name){
    switch(error.name){
      case 'ValidationError':
        for(field in error.errors){
          errors.push({errorCode:"VALIDATION_ERROR",
                       field:field,
                       errorMessage:error.errors[field].message});
        }
        responseBuilder.buildResponse(res, 400, {success:false, errors:errors});
        break;

      case 'CastError':
        errors.push({errorCode:"VALIDATION_ERROR",
                     errorMessage:"parameter value ["
                        + error.value
                        +"] is invalid, expected type:"+error.kind})
        responseBuilder.buildResponse(res, 400, {success:false, errors:errors});
        break;

      case 'MongoError':
        switch(error.code){
          case 11000:
            errors.push({errorCode:"DUPLICATION_ERROR", errorMessage:error.errmsg});
            responseBuilder.buildResponse(res, 409, {success:false, errors:errors});
            break;
          default:
            errors.push({errorCode:"DB_ERROR",
                         errorMessage:"db error occurred::" + error.errmsg});
            responseBuilder.buildResponse(res, 500, {success:false, errors:errors});
        }
        break;

      default:
        errors.push({errorCode:error.name, errorMessage:error.message});
        responseBuilder.buildResponse(res, 500, {success:false, errors:errors});
    }
  }
}

module.exports = ResponseBuilder;
