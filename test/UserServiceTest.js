process.env.NODE_ENV = 'test';

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
mongoose.Promise = global.Promise;

describe('user service api', function(){
  var url = 'http://localhost:8002'
  var conn;

  before(function(done){
    conn = mongoose.connect(config.db.mongodb);
    done();
  });

  afterEach(function(done){
    //clear test database
    conn.connection.db.dropDatabase();
    done();
  });

  describe('GET /api/user/:userId', function(){
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
        response.status.should.equal(200);
        response.body.data._id.should.equal(testUser._id + '');
        response.body.data.userId.should.equal(testUserInfo.userId);
        response.body.data.firstName.should.equal(testUserInfo.firstName);
        response.body.data.lastName.should.equal(testUserInfo.lastName);
        done();
      });
    });
  });

  describe('GET /api/users/:searchString', function(){
    var testUserInfo = {
      user1:{
        firstName: 'john',
        lastName: 'doe',
        userId: 'johnd123',
        password: 'testPassword'
      },
      user2:{
        firstName: 'jane',
        lastName: 'doe',
        userId: 'janed123',
        password: 'testPassword'
      },
      user3:{
        firstName: 'test',
        lastName: 'user',
        userId: 'testUser',
        password: 'testPassword'
      }
    };

    var testUser1 =  new User(testUserInfo.user1);
    var testUser2 = new User(testUserInfo.user2);
    var testUser3 = new User(testUserInfo.user3);

    before(function(done){
      testUser1.save(function(error, user){
        if(error){ throw error; }
        return testUser2.save();
      })
      .then(function(user){
        return testUser3.save();
      })
      .then(function(user){
        if(user){ done(); }
      });
    });

    it('should get users based on search string', function(done){
      request(url)
      .get('/api/users/doe')
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        Object.keys(response.body.data).length.should.equal(2);
        response.body.data[0].lastName.should.equal(testUser1.lastName);
        done();
      });
    });
  });

  describe('GET /api/user/:userId/:password', function(){
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

    it('should return ok', function(done){
      request(url)
      .get('/api/user/' + testUserInfo.userId + '/' + testUserInfo.password)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        done();
      });
    });

    it('should return with unauthorized error due to bad user id', function(done){
      request(url)
      .get('/api/user/badUser/' + testUserInfo.password)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(401);
        done();
      });
    });

    it('should return with unauthorized error due to bad password', function(done){
      request(url)
      .get('/api/user/' + testUserInfo.userId + '/badPassword')
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(401);
        done();
      });
    });
  });


  describe('POST /api/user', function(){
    var testUserInfo = {
      firstName: 'john',
      lastName: 'doe',
      userId: 'johnd123',
      password: 'testPassword',
    };

    it('should create user', function(done){
      request(url)
      .post('/api/user')
      .send(testUserInfo)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.data.userId.should.equal(testUserInfo.userId);
        response.body.data.firstName.should.equal(testUserInfo.firstName);
        response.body.data.lastName.should.equal(testUserInfo.lastName);
        done();
      });
    });
  });

  describe('GET /api/user/:userId/location', function(){
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

    it('should return with validation error for latitude', function(done){
      request(url)
      .put('/api/user/' + testUser._id + '/location')
      .send({latitude: 91, longitude: 1})
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        response.body.errors[0].errorCode.should.equal('VALIDATION_ERROR');
        response.body.errors[0].errorMessage.should.equal('the maximum value for lastKnownLatitude is 90');
        done();
      });
    });

    it('should return with validation error for longitude', function(done){
      request(url)
      .put('/api/user/' + testUser._id + '/location')
      .send({latitude: 90, longitude: 201})
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        response.body.errors[0].errorCode.should.equal('VALIDATION_ERROR');
        response.body.errors[0].errorMessage.should.equal('the maximum value for lastKnownLongitude is 180');
        done();
      });
    });

    it('should update user location', function(done){
      request(url)
      .put('/api/user/' + testUser._id + '/location')
      .send({latitude: 90, longitude: 180})
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        done();
      });
    });
  });
});
