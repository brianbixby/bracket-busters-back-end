'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const Team = require('../model/sportingEvent/team.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };

describe('Team routes', function() {
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
  afterEach( done => {
    Promise.all([
      fakeProfile.remove(),
      SportingEvent.remove({}),
      Team.remove({}),
    ])
      .then( () => done())
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
      .send()
      .set({
        Authorization: `Bearer ${this.mock.token}`,
      })
      .end((err, res) => {
        expect(res.status).toEqual(400);
        done();
      });
  });


  // describe('GET: /api/team/:teamId', () => {
  //   beforeEach( done => {
  //     return new Team({ teamName: 'Washington State', sportingEventID: this.sportingEvent._id, seed: 1, pretournamentRecord: '20-10', tags: 'PAC-12' }).save()
  //       .then( team => {
  //         this.team = team;
  //         done();
  //       })
  //       .catch(done);
  //   });
    
  //   describe('with a valid body', () => {
  //     it('should return a single team', done => { 
  //       request.get(`${url}/api/team/${this.team._id}`)
  //         .set({
  //           Authorization: `Bearer ${this.mock.token}`,
  //         })
  //         .end((err, res) => {
  //           if (err) return done(err);
  //           expect(res.status).toEqual(200);
  //           expect(res.body.teamName).toEqual('Washington State');
  //           expect(res.body.sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
  //           expect(res.body.seed).toEqual(1);
  //           expect(res.body.pretournamentRecord).toEqual('20-10');
  //           expect(res.body.tags.toString()).toEqual('PAC-12');
  //           done();
  //         });
  //     });

  //     it('should return a 401 when no token is provided', done => {
  //       request.get(`${url}/api/team/${this.team._id}`)
  //         .set({
  //           Authorization: `Bearer `,
  //         })
  //         .end((err, res) => {
  //           expect(res.status).toEqual(401);
  //           done();
  //         });
  //     });

  //     it('should return a 404 for a valid req with a team id not found', done => {
  //       request.get(`${url}/api/team/wegewghqewh`)
  //         .set({
  //           Authorization: `Bearer ${this.mock.token}`,
  //         })
  //         .end((err, res) => {
  //           expect(res.status).toEqual(404);
  //           done();
  //         });
  //     });

  //     it('should return all teams', done => { 
  //       request.get(`${url}/api/teams`)
  //         .set({
  //           Authorization: `Bearer ${this.mock.token}`,
  //         })
  //         .end((err, res) => {
  //           if (err) return done(err);
  //           expect(res.status).toEqual(200);
  //           expect(res.body[0].teamName).toEqual('Washington State');
  //           expect(res.body[0].sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
  //           expect(res.body[0].seed).toEqual(1);
  //           expect(res.body[0].pretournamentRecord).toEqual('20-10');
  //           expect(res.body[0].tags.toString()).toEqual('PAC-12');
  //           done();
  //         });
  //     });

  //     describe('PUT: /api/team/:teamId', () => {
  //       it('should update and return a teamwith a 200 status', done => {
  //         request.put(`${url}/api/team/${this.team._id}`)
  //           .send({ wins: 2 })
  //           .set({
  //             Authorization: `Bearer ${this.mock.token}`,
  //           })
  //           .end((err, res) => {
  //             if (err) return done(err);
  //             expect(res.status).toEqual(200);
  //             expect(res.body.teamName).toEqual('Washington State');
  //             expect(res.body.sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
  //             expect(res.body.seed).toEqual(1);
  //             expect(res.body.wins).toEqual(2);
  //             expect(res.body.pretournamentRecord).toEqual('20-10');
  //             expect(res.body.tags.toString()).toEqual('PAC-12');
  //             done();
  //           });
  //       });
    
  //       it('should  not update and return a 401 status, no token', done => {
  //         request.put(`${url}/api/team/${this.team._id}`)
  //           .send({ wins: 2 })
  //           .set({
  //             Authorization: `Bearer `,
  //           })
  //           .end((err, res) => {
  //             expect(res.status).toEqual(401);
  //             done();
  //           });
  //       });
    
  //       it('should  not update and return a 404 status for userpick not found', done => {
  //         request.put(`${url}/api/team/esghewher`)
  //           .send({ wins: 2 })
  //           .set({
  //             Authorization: `Bearer ${this.mock.token}`,
  //           })
  //           .end((err, res) => {
  //             expect(res.status).toEqual(404);
  //             done();
  //           });
  //       });
  //     });
  //   });
  // });
});