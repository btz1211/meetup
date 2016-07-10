var should = require('should');
var assert = require('assert');
var expect = require('chai').expect;
var request = require('supertest');
var mongoose = require('mongoose');
var logger = require('../logger');
var config = require('../config');
var helper = require('./helpers/testHelper');

require('../models/user')
require('../models/meetup')
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');

describe('api', function(){
  var url = 'http://localhost:8002'

  before(function(done){
    mongoose.connect(config.db.mongodb);
    done();
  });

  after(function(done){
    //clear test database
    User.remove({})
    .exec()
    .then(function(message){
      if(message.result.ok){
        return Meetup.remove({}).exec();
      }else{
        throw 'error cleaning user collection'
      }
    })
    .then(function(message){
      if(message.result.ok){
        done();
      }else{
        throw 'error cleaning meetup collection'
      }
    });
  });

  describe('user service api', function(){
    describe('get user api', function(){
      var testUserInfo = {
        firstName: 'john',
        lastName: 'doe',
        userId: 'johnd123',
        password: 'testPassword',
      };

      var testUser =  new User(testUserInfo);

      before(function(done){
        testUser.save(function(error, user){
          if(error){ throw error; }
          done();
        })
      });

      it('should return user with given id', function(done){
        request(url)
          .get('/api/user/' + testUser._id)
          .end(function(error, response){
            if(error){ throw error; }
            expect(response.status).to.equal(200);
            expect(response.body.data._id).to.equal(testUser._id + '');
            expect(response.body.data.userId).to.equal(testUserInfo.userId);
            expect(response.body.data.firstName).to.equal(testUserInfo.firstName);
            expect(response.body.data.lastName).to.equal(testUserInfo.lastName);
            done();
          });
        });
      });
  });
});
