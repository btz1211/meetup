/* Custom Error for bad Requests
** Uses HTTP status codes as error code */
var RequestError = function(code, message){
  this.code = code;
  this.message = message;
  this.name = "RequestError";
}

RequestError.prototype = Object.create(Error.prototype);
RequestError.prototype.constructor = RequestError;

module.exports = RequestError;
