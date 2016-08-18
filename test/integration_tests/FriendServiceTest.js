var request = require('supertest');
var promise = require('bluebird');
var mongoose = require('mongoose');
var server = require('./setup').server;
var logger = require.main.require('logger');
var helper = require.main.require('test/helpers/testHelper');
var User = mongoose.model('User');

describe('friend service api', function(){

  afterEach(function(done){
    User.remove({}, function(err) {
       done();
    });
  });

  describe('GET /api/friends/:userId - get friends', function(){
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
    testUser1.friends.push(testUser2._id);
    testUser1.friends.push(testUser3._id);
    testUser2.friends.push(testUser1._id);

    before(function(done){
      testUser1.save(function(error, user){
        console.log('user1::' + JSON.stringify(user));
        if(error){ throw error; }
        return testUser2.save();
      })
      .then(function(user){
        return testUser3.save();
      })
      .then(function(user){
        if(user3){ done(); }
      });
    });

    it('should get friends', function(done){
      request(server)
      .get('/api/friends/' + testUser1._id)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.data.length.should.equal(1);
        response.body.data[0]._id.should.equal(testUser2._id + '');
        response.body.data[0].firstName.should.equal(testUser2.firstName);
        response.body.data[0].lastName.should.equal(testUser2.lastName);
        done();
      });
    });
  });

  describe('GET /api/friend-requests/:userId - get friend requests', function(){
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
    testUser1.friends.push(testUser2._id);
    testUser1.friends.push(testUser3._id);

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

    it('should get friend requests', function(done){
      request(server)
      .get('/api/friend-requests/' + testUser1._id)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.data.length.should.equal(2);

        //convert data to json for better comparison
        var friendRequestJson = helper.covertArrayToObjectWithId(response.body.data, '_id');
        logger.info('requests::' + JSON.stringify(response.body.data));

        testUser2.firstName.should.equal(friendRequestJson[testUser2._id].firstName);
        testUser2.lastName.should.equal(friendRequestJson[testUser2._id].lastName);
        testUser2.userId.should.equal(friendRequestJson[testUser2._id].userId);

        testUser3.firstName.should.equal(friendRequestJson[testUser3._id].firstName);
        testUser3.lastName.should.equal(friendRequestJson[testUser3._id].lastName);
        testUser3.userId.should.equal(friendRequestJson[testUser3._id].userId);

        done();
      });
    })
  });

  describe('GET /api/friend-invites/:userId - get friend invites', function(){
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
    testUser1.friends.push(testUser3._id);
    testUser2.friends.push(testUser3._id);

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

    it('should get friend invites', function(done){
      request(server)
      .get('/api/friend-invitations/' + testUser3._id)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.data.length.should.equal(2);

        //convert data to json for better comparison
        var friendInvitationJson = helper.covertArrayToObjectWithId(response.body.data, '_id');
        logger.info('invitations::' + JSON.stringify(response.body.data));

        testUser1.firstName.should.equal(friendInvitationJson[testUser1._id].firstName);
        testUser1.lastName.should.equal(friendInvitationJson[testUser1._id].lastName);
        testUser1.userId.should.equal(friendInvitationJson[testUser1._id].userId);

        testUser2.firstName.should.equal(friendInvitationJson[testUser2._id].firstName);
        testUser2.lastName.should.equal(friendInvitationJson[testUser2._id].lastName);
        testUser2.userId.should.equal(friendInvitationJson[testUser2._id].userId);

        done();
      });
    })
  });

  describe('GET /api/friends/:userId/search/:searchString - search friends', function(){
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

    var testUser1 = new User(testUserInfo.user1);
    var testUser2 = new User(testUserInfo.user2);
    var testUser3 = new User(testUserInfo.user3);
    testUser1.friends.push(testUser2._id);
    testUser1.friends.push(testUser3._id);
    testUser2.friends.push(testUser1._id);
    testUser3.friends.push(testUser1._id);

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
    it('should get friends based on search string', function(done){
      request(server)
      .get('/api/friends/' +  testUser1._id + '/search/test')
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.data.length.should.equal(1);
        logger.info('friends::' + JSON.stringify(response.body.data));

        friend = response.body.data[0];
        friend.firstName.should.equal(testUser3.firstName);
        friend.lastName.should.equal(testUser3.lastName);
        friend.userId.should.equal(testUser3.userId);

        done();
      });
    })
  });

  describe('PUT /api/friend/add/:source/:target - add friend', function(){
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
    }

    var testUser1 = new User(testUserInfo.user1);
    var testUser2 = new User(testUserInfo.user2);

    before(function(done){
      testUser1.save(function(error, user){
        if(error){ throw error; }
        return testUser2.save();
      })
      .then(function(user){
        if(user){ done(); }
      });
    });

    it('should send friend request', function(done){
      request(server)
      .put('/api/friend/add/' + testUser1._id + '/' + testUser2._id)
      .end(function(error, response){
        if(error){ throw error; }
        response.status.should.equal(200);
        response.body.success.should.equal(true);

        User.findOne({_id: testUser1._id})
        .exec(function(error, user){
          if(error){ throw error; }
          user.friends.should.containEql(testUser2._id);
          done();
        })
      });
    });
  });
});
