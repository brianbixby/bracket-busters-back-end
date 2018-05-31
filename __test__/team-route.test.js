'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const Team = require('../model/sportingEvent/team.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const url = 'http://localhost:3000';
const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };

describe('Team routes', function() {
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
  afterEach( done => {
    return Promise.all([
      SportingEvent.remove({}),
      Team.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });
  it('should post and return a team', done => {
    request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/team`)
      .send({ teamName: 'Washington State', sportingEventID: this.sportingEvent._id, seed: 1, pretournamentRecord: '20-10', tags: 'PAC-12', color: 'blue', image: 'www.imageurl.com', teamCity: 'seattle' })
      .set({
        Authorization: `Bearer ${this.mock.token}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.teamName).toEqual('Washington State');
        expect(res.body.sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
        expect(res.body.seed).toEqual(1);
        expect(res.body.pretournamentRecord).toEqual('20-10');
        expect(res.body.tags.toString()).toEqual('PAC-12');
        done();
      });
  });
  it('should return 404 for route not found', done => {
    request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/te`)
      .send({ teamName: 'Washington State', sportingEventID: this.sportingEvent._id, seed: 1, pretournamentRecord: '20-10', tags: 'PAC-12' })
      .set({
        Authorization: `Bearer ${this.mock.token}`,
      })
      .end((err, res) => {
        expect(res.status).toEqual(404);
        done();
      });
  });
  it('should return a 401 error, no token', done => {
    request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/team`)
      .send({ teamName: 'Washington State', sportingEventID: this.sportingEvent._id, seed: 1, pretournamentRecord: '20-10', tags: 'PAC-12' })
      .set({
        Authorization: `Bearer `,
      })
      .end((err, res) => {
        expect(res.status).toEqual(401);
        done();
      });
  });
  it('should return a 400 error, body error', done => {
    request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/team`)
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