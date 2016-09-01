var should = require('should');
var mongoose = require('mongoose');
var ObjectUtil = require.main.require('util/ObjectUtil');

context('Object Utility', function(){
  var objectUtil = new ObjectUtil();

  describe('.isNumberInt', function(){
    it('should return true only for integers', function(done){
      objectUtil.isNumberInt("a").should.equal(false);
      objectUtil.isNumberInt(null).should.equal(false);
      objectUtil.isNumberInt(12.5).should.equal(false);
      objectUtil.isNumberInt(123).should.equal(true);
      done();
    });
  });

  describe('.isStringObjectId', function(){
    it('should return true only for valid object ids', function(done){
      objectUtil.isStringObjectId(null).should.equal(false);
      objectUtil.isStringObjectId(123).should.equal(false);
      objectUtil.isStringObjectId("null").should.equal(false);
      objectUtil.isStringObjectId("zzzzzzzzzzzz").should.equal(false);
      objectUtil.isStringObjectId("53cb6b9b4f4ddef1ad47f943").should.equal(true);
      done();
    });
  });

  describe('.convertStringToObjectId', function(){
    it('should convert string to object id', function(done){
      objectUtil.convertStringToObjectId('53cb6b9b4f4ddef1ad47f943').should
        .eql(mongoose.Types.ObjectId('53cb6b9b4f4ddef1ad47f943'));

      done();
    });

    it('should return original string for invalid object id strings', function(done){
      objectUtil.convertStringToObjectId('test').should
        .equal('test');

      done();
    });
  });
});
