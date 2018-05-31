'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const ScoreBoard = require('../model/league/scoreBoard.js');
const League = require('../model/league/league.js');
const MessageBoard = require('../model/league/messageBoard.js');
const Comment = require('../model/league/comment.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const url = 'http://localhost:3000';
const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };
const exampleLeague = { leagueName: 'example league name', scoring: 'regular', poolSize: 0, privacy: 'public', motto: 'league motto'}; 

describe('Comment routes', function() {
  beforeAll( done => serverToggle.serverOn(server, done));
  afterAll( done => serverToggle.serverOff(server, done));
  beforeAll( done => {
    return fakeProfile.create()
      .then( mock => {
        this.mock = mock;
        return done();
      })
      .catch(done);
  });
  afterAll(done => {
    return fakeProfile.remove()
      .then(() => done())
      .catch(done);
  });
  beforeEach( done => {
    return new SportingEvent(updatedSportingEvent).save()
      .then( sportingEve => {
        this.sportingEvent = sportingEve;
        return done();
      })
      .catch(done);
  });
  beforeEach(done => {
    exampleLeague.sportingEventID = this.sportingEvent._id;
    exampleLeague.owner = this.mock.profile.userID;
    exampleLeague.users = [this.mock.profile.userId];
    exampleLeague.ownerName = this.mock.profile.username;
    return new League(exampleLeague).save()
      .then( myLeague => {
        this.league = myLeague;
        return done();
      })
      .catch(done);
  });
  beforeEach(done => {
    return new ScoreBoard({ userID: this.mock.profile.userID, leagueID: this.league._id, sportingEventID: this.sportingEvent._id }).save()
      .then( sBoard => {
        this.scoreBoard = sBoard;
        return done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new MessageBoard({ leagueID: this.league._id }).save()
      .then( mBoard => {
        this.messageBoard = mBoard;
        return done();
      })
      .catch(done);
  });
  afterEach( done => {
    return Promise.all([
      SportingEvent.remove({}),
      League.remove({}),
      ScoreBoard.remove({}),
      MessageBoard.remove({}),
      Comment.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });
  afterEach(() => {
    delete exampleLeague.sportingEventID;
    delete exampleLeague.owner;
    delete exampleLeague.users;
    delete exampleLeague.ownerName;
  });
  describe('POST: /api/messageboard/:messageBoardId/comment', () => {
    it('should create a comment and return a 200 status', done => {
      request.post(`${url}/api/messageboard/${this.messageBoard._id}/comment`)
        .send({ userID: this.mock.profile.userID,  messageBoardID: this.messageBoard._id, content: 'example content' })
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.userID.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body.messageBoardID.toString()).toEqual(this.messageBoard._id.toString());
          expect(res.body.content).toEqual('example content');
          done();
        });
    });
    it('should return 404 for route not found', done => {
      request.post(`${url}/api/messageboard/${this.messageBoard._id}/com`)
        .send({ userID: this.mock.profile.userID, messageBoardID: this.messageBoard._id, content: 'example content' })
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
    it('should return a 401 error, no token', done => {
      request.post(`${url}/api/messageboard/${this.messageBoard._id}/comment`)
        .send({ userID: this.mock.profile.userID, messageBoardID: this.messageBoard._id, content: 'example content' })
        .set({
          Authorization: `Bearer `,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return a 400 error, no body', done => {
      request.post(`${url}/api/messageboard/${this.messageBoard._id}/comment`)
        .send({})
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });

  describe('POST: /api/comments/messageboard', () => {
    beforeEach(done => {
      return new Comment({ userID: this.mock.profile.userID, username: this.mock.profile.username, messageBoardID: this.messageBoard._id, content: 'example content' }).save()
        .then( commentz => {
          this.comment = commentz;
          return done();
        })
        .catch(done);
    });
    it('should return array of comments and a 200 status', done => {
      request.post(`${url}/api/comments/messageboard`)
        .send([this.comment._id])
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].userID.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body[0].username).toEqual(this.mock.profile.username);
          expect(res.body[0].messageBoardID.toString()).toEqual(this.messageBoard._id.toString());
          expect(res.body[0].content).toEqual('example content');
          done();
        });
    });
    it('should return 404 for no comments found', done => {
      request.post(`${url}/api/comments/messageboard`)
        .send(['asfwf'])
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('GET: /api/comment/:commentId && api/comments', () => {
    beforeEach( done => {
      return new Comment({ userID: this.mock.profile.userID, username: this.mock.profile.username, messageBoardID: this.messageBoard._id, content: 'example content' }).save()
        .then( commentz => {
          this.comment = commentz;
          return done();
        })
        .catch(done);
    });
    it('should return a comment and a 200 status', done => {
      request.get(`${url}/api/comment/${this.comment._id}`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.userID.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body.messageBoardID.toString()).toEqual(this.messageBoard._id.toString());
          expect(res.body.content).toEqual('example content');
          done();
        });
    });
    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/comment/${this.comment._id}`)
        .set({
          Authorization: `Bearer `,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return a 404 for a valid req with a comment id not found', done => {
      request.get(`${url}/api/comment/erghreh`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
    it('should return all lists and a 200 status', done => {
      request.get(`${url}/api/comments`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].userID.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body[0].messageBoardID.toString()).toEqual(this.messageBoard._id.toString());
          expect(res.body[0].content).toEqual('example content');
          done();
        });
    });
    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/comments`)
        .set({
          Authorization: 'Bearer ',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
  });
});