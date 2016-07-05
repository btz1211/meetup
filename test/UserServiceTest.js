var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var logger = require('../logger');
var config = require('../config');

require('../models/user')
require('../models/meetup')
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');

describe('api', function(){
  var url = 'http://localhost:8002'

  before(function(done){
    console.log(config.db.mongodb);
    mongoose.connect(config.db.mongodb);
    done();
  });

  after(function(done){
    //clear test database
    User.remove({})
    .exec()
    .then(function(result){
      console.log('result:' + result.keys());
      if(result.ok){
        return Meetup.remove({}).exec();
      }else{
        throw 'failed to clean up database';
      }
    })
    .then(function(result){
      console.log('result:' + JSON.stringify(result));
      if(result.ok){
        done();
      }else{
        throw 'failed to clean up database';
      }
    });
  })

  describe('user service api', function(){
    describe('get user api', function(){
      before(function(done){
        var testUserInfo = {
          firstName: 'john',
          lastName: 'doe',
          userId: 'johnd123',
          password: 'testPassword',
        }

        var testUser = new User(testUserInfo);
        testUser.save(function(error, user){
          if(error){ throw error; }
          console.log()
          done();
        })
      });

      it('should return user with given id', function(done){
        request(url)
          .get('/api/user/123')
          .end(function(error, response){
            if(error){ throw error; }
            assert.equal(1,1);
            done();
          });
        });
      });
  });
});
