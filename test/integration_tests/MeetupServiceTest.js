var request = require('supertest');
var mongoose = require('mongoose');
var server = require('./setup').server;
var logger = require.main.require('logger');
var helper = require.main.require('test/helpers/testHelper');
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');

describe('meetup service api', function(){
  afterEach(function(done){
    Meetup.remove({}, function(err) {
       done();
    });
  });

  describe('GET /api/meetups/:userId - get meetups for user', function(){
    var testUserInfo = {
      user1:{
        firstName: 'john',
        lastName: 'doe',
        userId: 'johnd123',
        password: 'testPassword'
      }
    };

    var meetups = {
      badLocationMeetup:{
        name: 'Bad Owner and Location Meetup',
        address: '123 Test Address',
        longitude: 200,
        latitude: 200,
        startTime: '12/11/1988',
        endTime: '1',
        status: '2',
        owner:'FFFFFFFFFFFFFFFFFFFFFFFF'
      },
      missingInfoMeetup:{
      },
      goodMeetup:{
        name: 'Good Meetup',
        address: '123 Test Address',
        longitude: 1,
        latitude: 1,
        startTime: '5',
        endTime: '1',
      }
    };

    var testUser1 =  new User(testUserInfo.user1);
    before(function(done){
      testUser1.save(function(error, user){
        if(error){ throw error; }
        if(user){
          meetups.goodMeetup.owner = user._id;
          done();
        }
      });
    });

    it('should return with errors for owner and location', function(done){
      request(server)
      .post('/api/meetup')
      .send(meetups.badLocationMeetup)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        var errorJson = helper.covertArrayToObjectWithId(response.body.errors, 'field');
        logger.info('[INFO] - errors::' + JSON.stringify(errorJson));

        errorJson['owner'].errorCode.should.equal('VALIDATION_ERROR');
        errorJson['owner'].errorMessage.should.equal('owner[ffffffffffffffffffffffff] is an invalid user');
        errorJson['latitude'].errorCode.should.equal('VALIDATION_ERROR');
        errorJson['latitude'].errorMessage.should.equal('the maximum value for latitude is 90');
        errorJson['longitude'].errorCode.should.equal('VALIDATION_ERROR');
        errorJson['longitude'].errorMessage.should.equal('the maximum value for longitude is 180');
        done();
      });
    });

    it('should return with errors complaining missing information', function(done){
      request(server)
      .post('/api/meetup')
      .send(meetups.missingInfoMeetup)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        response.body.errors.length.should.equal(7);
        var errorJson = helper.covertArrayToObjectWithId(response.body.errors, 'field');
        logger.info('[INFO] - missing params::' + JSON.stringify(errorJson));
        errorJson['name'].errorMessage.should.equal('name is required');
        errorJson['address'].errorMessage.should.equal('address is required');
        errorJson['latitude'].errorMessage.should.equal('latitude is required');
        errorJson['longitude'].errorMessage.should.equal('longitude is required');
        errorJson['startTime'].errorMessage.should.equal('startTime is required');
        errorJson['endTime'].errorMessage.should.equal('endTime is required');
        errorJson['owner'].errorMessage.should.equal('owner is required');
        done();
      });
    });
  });
});
