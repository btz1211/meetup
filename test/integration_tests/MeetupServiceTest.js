var request = require('supertest');
var mongoose = require('mongoose');
var server = require('./setup').server;
var logger = require.main.require('logger');
var helper = require.main.require('test/helpers/testHelper');
var User = mongoose.model('User');
var Meetup = mongoose.model('Meetup');
var Meetuper = mongoose.model('Meetuper');

describe('meetup service api', function(){
  //create test users
  var testUserInfo = {
    user1:{
      firstName: 'john',
      lastName: 'doe',
      userId: 'johnd123',
      password: 'testPassword'
    },
    user2:{
      firstName: 'meetuper',
      lastName: 'one',
      userId: 'testUser1',
      password: 'testPassword'
    },
    user3:{
      firstName: 'meetuper',
      lastName: 'two',
      userId: 'testUser2',
      password: 'testPassword'
    }
  };

  var testUser1 = new User(testUserInfo.user1);
  var testUser2 = new User(testUserInfo.user2);
  var testUser3 = new User(testUserInfo.user3);
  before(function(done){
    testUser1.save(function(error, user){
      if(error){ throw error; }
      if(user){ return testUser2.save(); }
    }).then(function(user){
      return testUser3.save();
    }).then(function(user){
      if(user){ done(); }
    });
  });

  afterEach(function(done){
    Meetup.remove({}, function(err) {
       done();
    });
  });

  after(function(done){
    User.remove({}, function(err){
      done();
    });
  });

  describe('GET /api/meetup/:meetupId - get meetup', function(){
    var meetupInfo = {
      name: 'Test Meetup',
      address: '123 Test Address',
      longitude: 1,
      latitude: 1,
      startTime: '1',
      endTime: '1',
      owner: testUser1._id
    }

    var meetup = new Meetup(meetupInfo);
    before(function(done){
      meetup.save(function(error, meetup){
        if(error){ throw error; }
        if(meetup){ done(); }
      });
    });

    it('should get meetup', function(done){
      request(server)
      .get('/api/meetup/' + meetup._id)
      .end(function(error, response){
        response.status.should.equal(200);
        var returnedMeetup = response.body.data;
        logger.info('meetup::' + JSON.stringify(returnedMeetup));

        returnedMeetup._id.should.equal(meetup._id + '');
        returnedMeetup.name.should.equal(meetup.name);
        returnedMeetup.latitude.should.equal(meetup.latitude);
        returnedMeetup.longitude.should.equal(meetup.longitude);
        returnedMeetup.status.should.equal('INPROGRESS');
        done();
      });
    });
  });

  describe('GET /api/meetups/:userId - get meetups for user', function(){
    var meetupInfo = {
      meetup1:{
        name: 'Meetup 1',
        address: '123 Test Address',
        longitude: 1,
        latitude: 1,
        startTime: '1',
        endTime: '1',
        owner: testUser1._id
      },
      meetup2:{
        name: 'Meetup 2',
        address: '456 Test Address',
        longitude: 2,
        latitude: 2,
        startTime: '1',
        endTime: '1',
        owner: testUser1._id
      }
    }

    var meetup1 = new Meetup(meetupInfo.meetup1);
    var meetup2 = new Meetup(meetupInfo.meetup2);
    before(function(done){
      meetup1.save(function(error, meetup){
        if(error){ throw error; }
        return meetup2.save();
      }).then(function(meetup){
        if(meetup){ done(); }
      });
    });

    it('should get meetups for user', function(done){
      request(server)
      .get('/api/meetups/' + testUser1._id)
      .end(function(error, response){
        response.status.should.equal(200);
        var userMeetups = helper.covertArrayToObjectWithId(response.body.data, 'name');
        logger.info('meetups for user::' + JSON.stringify(userMeetups));

        userMeetups['Meetup 1'].address.should.equal(meetupInfo.meetup1.address);
        userMeetups['Meetup 1'].latitude.should.equal(meetupInfo.meetup1.latitude);
        userMeetups['Meetup 1'].longitude.should.equal(meetupInfo.meetup1.longitude);
        userMeetups['Meetup 1'].status.should.equal("INPROGRESS"); //default status should be INPROGRESS

        userMeetups['Meetup 2'].address.should.equal(meetupInfo.meetup2.address);
        userMeetups['Meetup 2'].latitude.should.equal(meetupInfo.meetup2.latitude);
        userMeetups['Meetup 2'].longitude.should.equal(meetupInfo.meetup2.longitude);
        userMeetups['Meetup 2'].status.should.equal("INPROGRESS"); //default status should be INPROGRESS
        done();
      });
    })
  });

  describe('GET /api/meetup/:meetupId/meetupers - get meetupers for meetup', function(){
    var meetupInfo = {
      name: 'Test Meetup',
      address: '123 Test Address',
      longitude: 1,
      latitude: 1,
      startTime: '1',
      endTime: '1',
      owner: testUser1._id
    };

    var meetup = new Meetup(meetupInfo);
    meetup.meetupers.push({ user: testUser2._id });
    meetup.meetupers.push({ user: testUser3._id });

    before(function(done){
      meetup.save(function(error, meetup){
        if(error){ throw error; }
        if(meetup){ done(); }
      });
    });

    it('should get meetupers for the meetup', function(done){
      request(server)
      .get('/api/meetup/' + meetup._id + '/meetupers')
      .end(function(error, response){
        if(error){ throw error; }

        response.status.should.equal(200);
        response.body.data.length.should.equal(2);

        var meetupers = helper.covertArrayToObjectWithId(response.body.data, 'userId');
        logger.info('meetupers::' + JSON.stringify(meetupers));
        meetupers['testUser1'].firstName.should.equal('meetuper');
        meetupers['testUser1'].lastName.should.equal('one');
        meetupers['testUser1']._id.should.equal(testUser2._id + '');
        meetupers['testUser1'].status.should.equal('PENDING'); //default status

        meetupers['testUser2'].firstName.should.equal('meetuper');
        meetupers['testUser2'].lastName.should.equal('two');
        meetupers['testUser2']._id.should.equal(testUser3._id + '');
        meetupers['testUser2'].status.should.equal('PENDING'); //default status
        done();
      });
    });
  });

  describe('PUT /api/meetup/:meetupId - update meetup', function(){
    var meetupInfo = {
      name: 'Test Meetup',
      address: '123 Test Address',
      longitude: 1,
      latitude: 1,
      startTime: '1',
      endTime: '1',
      owner: testUser1._id
    }

    var newMeetupInfo = {
      name: 'Updated Meetup',
      address: '456 Test Address',
      longitude: 2,
      latitude: 2,
      status: 'CANCELLED'
    }

    var meetup = new Meetup(meetupInfo);
    before(function(done){
      meetup.save(function(error, meetup){
        if(error){ throw error; }
        if(meetup){ done(); }
      });
    });

    it('should update meetup with new info', function(done){
      request(server)
      .put('/api/meetup/' + meetup._id)
      .send(newMeetupInfo)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);

        Meetup.findOne({_id: meetup._id}, function(error, updatedMeetup){
          logger.info('updated meetup::' + JSON.stringify(updatedMeetup));
          updatedMeetup.name.should.equal(newMeetupInfo.name);
          updatedMeetup.address.should.equal(newMeetupInfo.address);
          updatedMeetup.latitude.should.equal(newMeetupInfo.latitude);
          updatedMeetup.longitude.should.equal(newMeetupInfo.longitude);
          updatedMeetup.status.should.equal(newMeetupInfo.status);
          done();
        })
      });
    });
  });

  describe('PUT /api/meetup/:meetupId - add meetupers', function(){
    var meetupInfo = {
      name: 'Test Meetup',
      address: '123 Test Address',
      longitude: 1,
      latitude: 1,
      startTime: '1',
      endTime: '1',
      owner: testUser1._id
    }

    var meetup = new Meetup(meetupInfo);
    before(function(done){
      meetup.save(function(error, meetup){
        if(error){ throw error; }
        if(meetup){ done(); }
      });
    });

    it('should add meetupers to meetup', function(done){
      request(server)
      .put('/api/meetup/' + meetup._id + '/meetuper/' + testUser2._id)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);

        Meetup.findOne({_id: meetup._id}, function(error, meetup){
          meetup.meetupers.length.should.equal(1);
          meetup.meetupers[0].user.toString().should.equal(testUser2._id.toString());
          done();
        })
      });
    });

    context('meetuper already exists', function(){
      var meetup = new Meetup(meetupInfo);
      meetup.meetupers.push({ user: testUser2._id });

      before(function(done){
        meetup.save(function(error, meetup){
          if(error){ throw error; }
          if(meetup){ done(); }
        });
      });

      it('should failed to add meetuper to meetup', function(done){
        request(server)
        .put('/api/meetup/' + meetup._id + '/meetuper/' + testUser2._id)
        .end(function(error, response){
          if(error){ throw error; }
          response.status.should.equal(400);
          response.body.errors[0].errorMessage.should.equal("unable to add meetuper, it already exists");
          done();
        });
      });
    });
  });

  describe('POST /api/meetup - create meetup', function(){
    var meetupInfo = {
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
      missingInfoMeetup:{},
      goodMeetup:{
        name: 'Good Meetup',
        address: '123 Test Address',
        longitude: 1,
        latitude: 1,
        startTime: '5',
        endTime: '1',
        owner: testUser1._id
      }
    };

    it('should return with errors for owner and location', function(done){
      request(server)
      .post('/api/meetup')
      .send(meetupInfo.badLocationMeetup)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        var errorJson = helper.covertArrayToObjectWithId(response.body.errors, 'field');
        logger.info('errors::' + JSON.stringify(errorJson));

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
      .send(meetupInfo.missingInfoMeetup)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(400);
        response.body.errors.length.should.equal(7);
        var errorJson = helper.covertArrayToObjectWithId(response.body.errors, 'field');
        logger.info('missing params::' + JSON.stringify(errorJson));
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

    it('should create meetup', function(done){
      request(server)
      .post('/api/meetup')
      .send(meetupInfo.goodMeetup)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        logger.info('created meetup::' + JSON.stringify(response.body.data));
        response.body.data['name'] = 'Good Meetup';
        done();
      });
    });
  });
});
