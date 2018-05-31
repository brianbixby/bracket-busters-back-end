
'use strict';

const request = require('superagent');
const faker = require('faker');
const League = require('../model/league/league.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const fakeProfile = require('./lib/fakeProfile.js');
const ScoreBoard = require('../model/league/scoreBoard.js');
const Team = require('../model/sportingEvent/team.js');
const Game = require('../model/sportingEvent/game.js');
const UserPick = require('../model/league/userPick.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

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
  privacy: 'private',
  motto: 'league motto',
  password: 'password',
};

const updatedSportingEvent = {
  sportingEventName: 'updated name',
  desc: 'updated desc',
  tags: 'updated tag',
};

describe('League routes', function() {
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
  beforeEach(done => {
    return new SportingEvent(updatedSportingEvent).save()
      .then(sportingEve => {
        this.sportingEvent = sportingEve;
        return done();
      })
      .catch(done);
  });
  afterEach(done => {
    return Promise.all([
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

  describe('private leagues', () => {
    describe('POST: /api/league/private/adduser', () => {
      describe('with a invalid req', () => {
        beforeEach(done => {
          examplePrivateLeague.sportingEventID = this.sportingEvent._id;
          examplePrivateLeague.owner = this.mock.profile.userID;
          examplePrivateLeague.ownerName = this.mock.profile.username;
          return new League(examplePrivateLeague).save()
            .then(myLeague => {
              this.league = myLeague;
              return done();
            })
            .catch(done);
        });
        it('should give 500 status', done => {
          request.post(`${url}/api/league/private/adduser`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send({ leagueName: 'private', password: 'password' })
            .end((err, res) => {
              expect(res.status).toEqual(500);
              done();
            });
        });
      });
    });
  });

  describe('public leagues', () => {
    beforeEach(done => {
      exampleLeague.sportingEventID = this.sportingEvent._id;
      exampleLeague.owner = this.mock.profile.userID;
      exampleLeague.ownerName = this.mock.profile.username;
      exampleLeague.users = [this.mock.profile.userID];
      return new League(exampleLeague).save()
        .then(myLeague => {
          this.league = myLeague;
          this.mock.profile.leagues = [this.league._id];
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
    beforeEach( done => {
      return new Team({ teamName: 'team1', teamCity: 'seattle', image: 'www.image.com', color: 'blue', pretournamentRecord: '5 - 0', sportingEventID: this.sportingEvent._id }).save()
        .then( team1 => {
          this.team1 = team1;
          return done();
        })
        .catch(done);
    });
    beforeEach( done => {
      return new Team({ teamName: 'team2', teamCity: 'portland', image: 'www.freeimage.com', color: 'red', pretournamentRecord: '0 - 5', sportingEventID: this.sportingEvent._id }).save()
        .then( team2 => {
          this.team2 = team2;
          return done();
        })
        .catch(done);
    });
    beforeEach( done => {
      return new Game({ sportingEventID: this.sportingEvent._id, dateTime: Date.now(), homeTeam: this.team1._id, awayTeam: this.team2._id }).save()
        .then( game => {
          this.game = game;
          return done();
        })
        .catch(done);
    });
    beforeEach( done => {
      return new UserPick({ userID: this.mock.profile.userID, leagueID: this.league._id, gameID: this.game._id, pick: this.team1._id, gameTime: Date.now() }).save()
        .then( userPick => {
          this.userPick = userPick;
          return done();
        })
        .catch(done);
    });
    afterEach( done => {
      return Promise.all([
        ScoreBoard.remove({}),
        Team.remove({}),
        Game.remove({}),
        UserPick.remove({}),
      ])
        .then(() => done())
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
            .send({})
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
    describe('PUT: /api/league/:leagueId/removeuser', () => {
      describe('with invalid req', () => {
        it('should give 500 status', done => {
          request.put(`${url}/api/league/${this.league._id}/removeuser`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(500);
              done();
            });
        });
      });
    });
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
            .send({})
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
});