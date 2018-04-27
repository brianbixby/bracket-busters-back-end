'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const MessageBoard = require('../model/league/messageBoard.js');
const League = require('../model/league/league.js');
const Group = require('../model/league/group.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };
const exampleLeague = { leagueName: 'example league name', scoring: 'regular', poolSize: 0, privacy: 'private'}; 

describe('MessageBoard routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });
  beforeEach( done => {
    return fakeProfile.create()
      .then( mock => {
        this.mock = mock;
        // this.mock.profile = this.mock.profile._rejectionHandler0;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new SportingEvent(updatedSportingEvent).save()
      .then( sportingEve => {
        this.sportingEvent = sportingEve;
        done();
      })
      .catch(done);
  });
  beforeEach(done => {
    exampleLeague.sportingEventID = this.sportingEvent._id;
    exampleLeague.owner = this.mock.profile.userID;
    return new League(exampleLeague).save()
      .then(myLeague => {
        this.league = myLeague;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new Group({ groupName: 'example group', privacy: 'public', owner: this.mock.profile.userID }).save()
      .then( group => {
        this.group = group;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    exampleLeague.sportingEventID = this.sportingEvent._id;
    exampleLeague.owner = this.mock.profile.userID;
    return new League(exampleLeague).save()
      .then( myLeague => {
        this.league = myLeague;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new MessageBoard({ leagueID: this.league._id, tags: 'example tag' }).save()
      .then( messageBoard1 => {
        this.messageBoard1 = messageBoard1;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new MessageBoard({ groupID: this.group._id, tags: 'example tag' }).save()
      .then( messageBoard2 => {
        this.messageBoard2 = messageBoard2;
        done();
      })
      .catch(done);
  });
  afterEach( done => {
    Promise.all([
      fakeProfile.remove(),
      SportingEvent.remove({}),
      League.remove({}),
      MessageBoard.remove({}),
      Group.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });
  afterEach( () => {
    delete exampleLeague.sportingEventID;
    delete exampleLeague.owner;
  });
  
  describe('GET: /api/messageboard/:messageBoardId & /aoi/messageboards', () => {
    describe('with a valid body', () => {
      it('should return a single messageboard', done => { 
        request.get(`${url}/api/messageboard/${this.messageBoard1._id}`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.leagueID.toString()).toEqual(this.league._id.toString());
            expect(res.body.tags.toString()).toEqual('example tag');
            done();
          });
      });

      it('should return a single messageboard', done => { 
        request.get(`${url}/api/messageboard/${this.messageBoard2._id}`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.groupID.toString()).toEqual(this.group._id.toString());
            expect(res.body.tags.toString()).toEqual('example tag');
            done();
          });
      });

      it('should return a 401 when no token is provided', done => {
        request.get(`${url}/api/messageboard/${this.messageBoard1._id}`)
          .set({
            Authorization: `Bearer `,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });

      it('should return a 404 for a valid req with a message board id not found', done => {
        request.get(`${url}/api/messageboard/egewgrgewhewrh`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should return all message boards', done => { 
        request.get(`${url}/api/messageboards`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body[0].leagueID.toString()).toEqual(this.league._id.toString());
            expect(res.body[0].tags.toString()).toEqual('example tag');
            expect(res.body[1].groupID.toString()).toEqual(this.group._id.toString());
            expect(res.body[1].tags.toString()).toEqual('example tag');
            done();
          });
      });
    });
  });
});