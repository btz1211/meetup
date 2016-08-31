var request = require('supertest');
var ResponseBuilder = require.main.require('util/ResponseBuilder');
var responseBuilder = new ResponseBuilder();
var http = require("express-mocks-http");
var should = require('should');

context('Response Builder', function(){

  describe('.buildResponse', function(){
    it('should build a successful response', function(done){
      var response = http.createResponse();
      responseBuilder.buildResponse(response, 200, {result:'hello'});

      response.statusCode.should.equal(200);
      JSON.parse(response._getData()).result.should.equal('hello');
      done();
    });
  });

  describe('.buildResponseWithError', function(){
    context('mongo error', function(){
      var error = new Error();
      error.name = 'MongoError';
      error.errmsg = "db error";

      it('should build response with mongo error', function(done){
        var response = http.createResponse();
        responseBuilder.buildResponseWithError(response, error);
        var result = JSON.parse(response._getData());

        response.statusCode.should.equal(400);
        JSON.stringify(result.errors[0]).should.equal(JSON.stringify(responseBuilder.parseMongoError(error)));
        done();
      });
    });

    context('cast error', function(){
      var error = new Error();
      error.name = 'CastError';
      error.value = "test";
      error.kind = "testType";

      it('should build response with mongo error', function(done){
        var response = http.createResponse();
        responseBuilder.buildResponseWithError(response, error);
        var result = JSON.parse(response._getData());

        response.statusCode.should.equal(400);
        result.errors[0].should.eql(responseBuilder.parseMongooseCastError(error));
        done();
      });
    });

    context('validation error', function(){
      var error = new Error();
      error.name = "ValidationError";
      error.errors = {
        error1:{
          message: 'message for error 1'
        },
        error2:{
          message: 'message for error 2'
        }
      };
      it('should build response with mongo error', function(done){
        var response = http.createResponse();
        responseBuilder.buildResponseWithError(response, error);
        var result = JSON.parse(response._getData());

        response.statusCode.should.equal(400);
        result.errors.should.eql(responseBuilder.parseMongooseValidationError(error));
        done();
      });
    });

    context('request error', function(){
      var error = new Error();
      error.name = 'RequestError';
      error.code = 204;
      error.message = "not found";
      it('should build response with mongo error', function(done){
        var response = http.createResponse();
        responseBuilder.buildResponseWithError(response, error);
        var result = JSON.parse(response._getData());

        response.statusCode.should.equal(error.code);
        result.errors[0].should.equal(error.message);
        done();
      });
    });

    context('other errors', function(){
      var error = new Error();
      error.name = 'RandomError';
      error.message = "not found";
      it('should build response with mongo error', function(done){
        var response = http.createResponse();
        responseBuilder.buildResponseWithError(response, error);
        var result = JSON.parse(response._getData());

        response.statusCode.should.equal(500);
        result.errors[0].should.eql({errorCode:error.name, errorMessage:error.message});
        done();
      });
    })
  });
  context('helper methods', function(){
    describe('.parseMongoError', function(){

      context('code 11000', function(){
        var mongoError = new Error();
        mongoError.code = 11000;
        mongoError.name = "mongoError";
        mongoError.errmsg = "duplicate error";

        it('should return formatted mongo error for code 11000', function(done){
          var result = responseBuilder.parseMongoError(mongoError);
          result.errorCode.should.equal("DUPLICATION_ERROR");
          result.errorMessage.should.equal(mongoError.errmsg);
          done();
        })
      });

      context ('default mongo error', function(){
        var mongoError = {};
        mongoError.name = "mongoError";
        mongoError.errmsg = "db error";

        it('should return formatted default mongo error', function(done){
          var result = responseBuilder.parseMongoError(mongoError);
          result.errorCode.should.equal("DB_ERROR");
          result.errorMessage.should.equal("db error occurred::db error");
          done();
        })
      });
    });

    describe('.parseMongooseValidationError', function(){
      var mongooseValidationErrors = {};
      mongooseValidationErrors.errors = {
        error1:{
          message: 'message for error 1'
        },
        error2:{
          message: 'message for error 2'
        }
      };

      it('should return formatted validation errors', function(done){
        var errors = responseBuilder.parseMongooseValidationError(mongooseValidationErrors);
        errors.length.should.equal(2);
        errors[0].field.should.equal("error1");
        errors[0].errorCode.should.equal("VALIDATION_ERROR");
        errors[0].errorMessage.should.equal("message for error 1");
        errors[1].field.should.equal("error2");
        errors[1].errorCode.should.equal("VALIDATION_ERROR");
        errors[1].errorMessage.should.equal("message for error 2");
        done();
      });
    });

    describe('.parseMongooseCastError', function(){
      var mongooseCastError = {};
      mongooseCastError.value = "test";
      mongooseCastError.kind = "integer";

      it('should return formatted cast error', function(done){
        var error = responseBuilder.parseMongooseCastError(mongooseCastError);
        error.errorCode.should.equal("VALIDATION_ERROR");
        error.errorMessage.should.equal("parameter value [test] is invalid, expected type:integer");
        done();
      });
    });
  });
});
