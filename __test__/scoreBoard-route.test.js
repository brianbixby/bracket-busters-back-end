'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const ScoreBoard = require('../model/league/scoreBoard.js');
const League = require('../model/league/league.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const url = 'http://localhost:3000';
const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };
const exampleLeague = { leagueName: 'example league name', scoring: 'regular', poolSize: 0, privacy: 'public', motto: 'league motto'}; 

describe('Scoreboard routes', function() {
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
  beforeEach( done => {
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
  beforeEach( done => {
    return new ScoreBoard({ userID: this.mock.profile.userID, leagueID: this.league._id, sportingEventID: this.sportingEvent._id }).save()
      .then( sBoard => {
        this.scoreBoard = sBoard;
        return done();
      })
      .catch(done);
  });
  afterEach( done => {
    return Promise.all([
      SportingEvent.remove({}),
      League.remove({}),
      ScoreBoard.remove({}),
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
  describe('routes that need a scoreboard created', () => {
    it('should return scoreboards for a league and a 200 status', done => {
      request.get(`${url}/api/scoreboards/${this.league._id}`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].userID._id.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body[0].leagueID.toString()).toEqual(this.league._id.toString());
          expect(res.body[0].score).toEqual(0);
          done();
        });
    });
    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/scoreboards/${this.league._id}`)
        .set({
          Authorization: 'Bearer',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return a 404 for a valid req with a scoreboard id not found', done => {
      request.get(`${url}/api/scoreboards/a`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
    it('should return all scoreboards and a 200 status', done => {
      request.get(`${url}/api/scoreboards`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].userID.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body[0].leagueID.toString()).toEqual(this.league._id.toString());
          expect(res.body[0].score).toEqual(0);
          done();
        });
    });
    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/scoreboards`)
        .set({
          Authorization: 'Bearer',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return all top scoreboards and a 200 status', done => {
      request.get(`${url}/api/scoreboards/sportingevent/${this.sportingEvent._id}`)
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].userID._id.toString()).toEqual(this.mock.profile.userID.toString());
          expect(res.body[0].leagueID.toString()).toEqual(this.league._id.toString());
          expect(res.body[0].score).toEqual(0);
          done();
        });
    });
  });
});