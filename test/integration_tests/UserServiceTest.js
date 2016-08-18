var request = require('supertest');
var mongoose = require('mongoose');
var server = require('./setup').server;
var logger = require.main.require('logger');
var helper = require.main.require('test/helpers/testHelper');
var User = mongoose.model('User');

describe('user service api', function(){

  afterEach(function(done){
    User.remove({}, function(err) {
       done();
    });
  });

  describe('GET /api/user/:userId - get user', function(){
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
      request(server)
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

  describe('GET /api/users/:searchString - search users', function(){
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
        if(user){
          return testUser3.save();
        }
      })
      .then(function(user){
        if(user){ done(); }
      });
    });

    it('should get users based on search string', function(done){
      request(server)
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

  describe('GET /api/user/:userId/:password - authenticate user', function(){
    var testUserInfo = {
      firstName: 'john',
      lastName: 'doe',
      userId: 'johnd123',
      password: 'testPassword',
    };

    beforeEach(function(done){
      var testUser =  new User(testUserInfo);

      testUser.save(function(error, user){
        if(error){ throw error; }
        done();
      })
    });

    it('should return ok', function(done){
      request(server)
      .get('/api/user/' + testUserInfo.userId + '/' + testUserInfo.password)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        done();
      });
    });

    it('should return with unauthorized error due to bad user id', function(done){
      request(server)
      .get('/api/user/badUser/' + testUserInfo.password)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(401);
        done();
      });
    });

    it('should return with unauthorized error due to bad password', function(done){
      request(server)
      .get('/api/user/' + testUserInfo.userId + '/badPassword')
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(401);
        done();
      });
    });
  });

  describe('POST /api/user, create user', function(){
    var testUserInfo = {
      firstName: 'john',
      lastName: 'doe',
      userId: 'johnd123',
      password: 'testPassword',
    };

    it('should create user', function(done){
      request(server)
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

  describe('GET /api/user/:userId/location - update user location', function(){
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
      request(server)
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
      request(server)
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
      request(server)
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
