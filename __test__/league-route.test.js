
'use strict';

const request = require('superagent');
const faker = require('faker');
const League = require('../model/league/league.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const fakeProfile = require('./lib/fakeProfile.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

const exampleLeague = {
  leagueName: faker.company.companyName(),
  scoring: 'some scoring',
  poolSize: faker.random.number(),
  privacy: 'public',
  motto: 'league motto',
};
const examplePrivateLeague = {
  leagueName: faker.company.companyName(),
  scoring: 'some scoring',
  poolSize: faker.random.number(),
  privacy: 'public',
  motto: 'league motto',
  password: 'password',
};

const updatedSportingEvent = {
  sportingEventName: 'updated name',
  desc: 'updated desc',
  tags: 'updated tag',
};

describe('League routes', () => {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });
  afterAll(done => {
    serverToggle.serverOff(server, done);
  });

  beforeEach(done => {
    return fakeProfile.create()
      .then(mock => {
        this.mock = mock;
        done();
      })
      .catch(done);
  });
  beforeEach(done => {
    return new SportingEvent(updatedSportingEvent).save()
      .then(sportingEve => {
        this.sportingEvent = sportingEve;
        done();
      })
      .catch(done);
  });
  afterEach(done => {
    Promise.all([
      fakeProfile.remove(),
      SportingEvent.remove({}),
      League.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });
  afterEach(() => {
    delete exampleLeague.sportingEventID;
    delete exampleLeague.owner;
  });

  // describe('private leagues', () => {
  //   describe('POST: /api/league/private/adduser', () => {
  //     describe('with valid body and token', () => {
  //       beforeEach(done => {
  //         examplePrivateLeague.sportingEventID = this.sportingEvent._id;
  //         examplePrivateLeague.owner = this.mock.profile.userID;
  //         examplePrivateLeague.ownerName = this.mock.profile.username;
  //         examplePrivateLeague.users = [this.mock.profile.userID];
  //         return new League(examplePrivateLeague).save()
  //           .then(myLeague => {
  //             this.league = myLeague;
  //             done();
  //           })
  //           .catch(done);
  //       });
  //       it('should give 200 status', done => {
  //         request.post(`${url}/api/league/private/adduser`)
  //           .set({
  //             Authorization: `Bearer ${this.mock.token}`,
  //           })
  //           .send({ leagueName: this.league.leagueName, password: this.league.password })
  //           .end((err, res) => {
  //             expect(res.status).toEqual(200);
  //             expect(res.body.leagueName).toEqual(examplePrivateLeague.leagueName);
  //             expect(res.body.privacy).toEqual(examplePrivateLeague.privacy);
  //             expect(res.body.motto).toEqual(examplePrivateLeague.motto);
  //             done();
  //           });
  //       });
  //     });
  //   });
  // });

  describe('public leagues', () => {
    beforeEach(done => {
      exampleLeague.sportingEventID = this.sportingEvent._id;
      exampleLeague.owner = this.mock.profile.userID;
      exampleLeague.ownerName = this.mock.profile.username;
      exampleLeague.users = [this.mock.profile.userID];
      return new League(exampleLeague).save()
        .then(myLeague => {
          this.league = myLeague;
          done();
        })
        .catch(done);
    });
    describe('POST: /api/sportingevent/sportingeventId/league', () => {
      describe('with a valid body and token', () => {
        it('should post and return a league', done => {
          request.post(`${url}/api/sportingevent/${this.league.sportingEventID}/league`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send(exampleLeague)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(200);
              expect(res.body.leagueName).toEqual(exampleLeague.leagueName);
              expect(res.body.scoring).toEqual('some scoring');
              expect(res.body.poolSize).toEqual(exampleLeague.poolSize);
              expect(res.body.privacy).toEqual(exampleLeague.privacy);
              done();
            });
        });
      });
      describe('with a bad body', () => {
        it('should send a 400 error', done => {
          request.post(`${url}/api/sportingevent/${this.league.sportingEventID}/league`)
            .send()
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(400);
              done();
            });
        });
      });
      describe('with valid body and no token', () => {
        it('should give 401 status', done => {
          request.post(`${url}/api/sportingevent/${this.league.sportingEventID}/league`)
            .set({
              Authorization: `Bearer `,
            })
            .send(exampleLeague)
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
    describe('POST: /api/leagues/user', () => {
      describe('with valid body and token', () => {
        it('should give 200 status', done => {
          request.post(`${url}/api/leagues/user`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send([this.league._id])
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body[0].leagueName).toEqual(exampleLeague.leagueName);
              expect(res.body[0].privacy).toEqual(exampleLeague.privacy);
              expect(res.body[0].motto).toEqual(exampleLeague.motto);
              done();
            });
        });
        it('should give 404 status', done => {
          request.post(`${url}/api/leagues/user`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send(['abc'])
            .end((err, res) => {
              expect(res.status).toEqual(404);
              done();
            });
        });
      });
    });
    describe('POST: /api/leagues/top/:leagueId', () => {
      describe('with valid body and token', () => {
        it('should give 200 status', done => {
          request.post(`${url}/api/leagues/top/${this.sportingEvent._id}`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send()
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body[0].leagueName).toEqual(exampleLeague.leagueName);
              expect(res.body[0].privacy).toEqual(exampleLeague.privacy);
              expect(res.body[0].motto).toEqual(exampleLeague.motto);
              done();
            });
        });
      });
    });
    describe('GET: /api/league/:leagueId', () => {
      describe('with valid leagueId', () => {
        it('should give 200 response code', done => {
          request.get(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body.leagueName).toEqual(exampleLeague.leagueName);
              expect(res.body.privacy).toEqual(exampleLeague.privacy);
              expect(res.body.motto).toEqual(exampleLeague.motto);
              done();
            });
        });
      });
      describe('with invalid leagueId', () => {
        it('should give a 404 error', done => {
          request.get(`${url}/api/league/1`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(404);
              done();
            });
        });
      });
      describe('with no token', () => {
        it('should give an error', done => {
          request.get(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer `,
            })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
    describe('GET: /api/leagues/allpublic', () => {
      describe('with valid leagueId', () => {
        it('should give 200 response code', done => {
          request.get(`${url}/api/leagues/allpublic`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body[0].leagueName).toEqual(exampleLeague.leagueName);
              expect(res.body[0].privacy).toEqual(exampleLeague.privacy);
              expect(res.body[0].owner).toEqual(exampleLeague.owner.toString());
              done();
            });
        });
      });
      describe('with no token', () => {
        it('should give an error', done => {
          request.get(`${url}/api/leagues/allpublic`)
            .set({
              Authorization: `Bearer `,
            })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
    describe('GET: /api/leagueNames/:leagueName', () => {
      describe('with valid leagueId', () => {
        it('should give 200 response code', done => {
          request.get(`${url}/api/leagueNames/${this.league.leagueName}wfqqfwqwf`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(200);
              done();
            });
        });
      });
      describe('with no token', () => {
        it('should give an error', done => {
          request.get(`${url}/api/leagueNames/${this.league.leagueName}`)
            .set({
              Authorization: `Bearer `,
            })
            .end((err, res) => {
              expect(res.status).toEqual(409);
              done();
            });
        });
      });
    });
    describe('PUT: /api/league/:leagueId/adduser', () => {
      describe('with valid id and token', () => {
        it('should give 200 status', done => {
          request.put(`${url}/api/league/${this.league._id}/adduser`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(200);
              done();
            });
        });
      });
    });
    // describe('PUT: /api/league/:leagueId/removeuser', () => {
    //   describe('with valid id and token', () => {
    //     it('should give 200 status', done => {
    //       request.put(`${url}/api/league/${this.league._id}/removeuser`)
    //         .set({
    //           Authorization: `Bearer ${this.mock.token}`,
    //         })
    //         .end((err, res) => {
    //           expect(res.status).toEqual(200);
    //           done();
    //         });
    //     });
    //   });
    // });
    describe('PUT: /api/league/:leagueId', () => {
      describe('with valid body and token', () => {
        it('should give 200 status', done => {
          request.put(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send({ leagueName: 'new league name' })
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body.leagueName).toEqual('new league name');
              done();
            });
        });
      });
  
      describe('with no body and valid token', () => {
        it('should give 400 status', done => {
          request.put(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send()
            .end((err, res) => {
              expect(res.status).toEqual(400);
              done();
            });
        });
      });
  
      describe('with valid body and no token', () => {
        it('should give 200 status', done => {
          request.put(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer `,
            })
            .send({ groupName: 'new league name' })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
    describe('DELETE: /api/league/:leagueId', () => {
      describe('with valid token', () => {
        it('should give 204 status', done => {
          request.delete(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(204);
              done();
            });
        });
      });
      describe('with no token', () => {
        it('should give 401 status', done => {
          request.delete(`${url}/api/league/${this.league._id}`)
            .set({
              Authorization: `Bearer `,
            })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
      describe('with invalid id', () => {
        it('should give 404 status', done => {
          request.delete(`${url}/api/league/123456`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(404);
              done();
            });
        });
      });
    });
  });








  // describe('PUT: /api/league/leagueID/adduser', () => {
  //   describe('with a valid body and id', () => {
  //     it('should give us a 200 status', done => {
  //       beforeEach(done => {
  //         exampleLeague.sportingEventID = this.sportingEvent._id;
  //         exampleLeague.owner = this.mock.profile.userID;
  //         exampleLeague.ownerName = this.mock.profile.username;
  //         return new League(exampleLeague).save()
  //           .then(myLeague => {
  //             this.league = myLeague;
  //             done();
  //           })
  //           .catch(done);
  //       });
  //       request.put(`${url}/api/league/${this.league.id}/adduser`)
  //         .set({
  //           Authorization: `Bearer ${this.mock.token}`,
  //         })
  //         .send(exampleLeague)
  //         .end((err, res) => {
  //           if (err) return done(err);
  //           expect(res.status).toEqual(200);
  //           done();
  //         });
  //     });
  //   });
  // });
  

});