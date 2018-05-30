'use strict';

const request = require('superagent');
const fakeProfile  = require('./lib/fakeProfile.js');
const SportingEvent = require('../model/sportingEvent/sportingEvent.js');
const Team = require('../model/sportingEvent/team.js');
const Game = require('../model/sportingEvent/game.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

const updatedSportingEvent = { sportingEventName: 'updated name', desc: 'updated desc', tags: 'updated tag' };

describe('Game routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });
  beforeEach(done => {
    return fakeProfile.create()
      .then( mock => {
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
  beforeEach( done => {
    return new Team({ teamName: 'team1', teamCity: 'seattle', image: 'www.image.com', pretournamentRecord: '20 - 0', color: 'red', sportingEventID: this.sportingEvent._id }).save()
      .then( team1 => {
        this.team1 = team1;
        done();
      })
      .catch(done);
  });
  beforeEach( done => {
    return new Team({ teamName: 'team2', teamCity: 'portland', image: 'www.image2.com', pretournamentRecord: '0 - 20', color: 'green', sportingEventID: this.sportingEvent._id }).save()
      .then( team2 => {
        this.team2 = team2;
        done();
      })
      .catch(done);
  });
  afterEach( done => {
    Promise.all([
      fakeProfile.remove(),
      SportingEvent.remove({}),
      Team.remove({}),
      Game.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/sportingevent/:sportingeventId/game', () => {
    it('should return a /api/sportingevent/:sportingeventId/game and a 200 status', done => {
      request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/game`)
        .send({ homeTeam: this.team1, awayTeam: this.team2, dateTime: Date.now(), sportingEventID: this.sportingEvent._id, tags: 'championship game' })
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.homeTeam.toString()).toEqual(this.team1._id.toString());
          expect(res.body.awayTeam.toString()).toEqual(this.team2._id.toString());
          expect(res.body.sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
          expect(res.body.tags.toString()).toEqual('championship game');
          done();
        });
    });

    it('should return 404 for route not found', done => {
      request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/ga`)
        .send({ homeTeam: this.team1, awayTeam: this.team2, dateTime: Date.now(), sportingEventID: this.sportingEvent._id, tags: 'championship game' })
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should return a 401 error, no token', done => {
      request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/game`)
        .send({ homeTeam: this.team1, awayTeam: this.team2, dateTime: Date.now(), sportingEventID: this.sportingEvent._id, tags: 'championship game' })
        .set({
          Authorization: `Bearer `,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 400 error, no body', done => {
      request.post(`${url}/api/sportingevent/${this.sportingEvent._id}/game`)
        .send()
        .set({
          Authorization: `Bearer ${this.mock.token}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    describe('GET: /api/game/:gameId && api/games', () => {
      beforeEach( done => {
        return new Game({ homeTeam: this.team1, awayTeam: this.team2, dateTime: Date.now(), sportingEventID: this.sportingEvent._id, tags: 'championship game' }).save()
          .then( game => {
            this.game = game;
            done();
          })
          .catch(done);
      });

      it('should return all game and a 200 status', done => {
        request.get(`${url}/api/games`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body[0].homeTeam.toString()).toEqual(this.team1._id.toString());
            expect(res.body[0].awayTeam.toString()).toEqual(this.team2._id.toString());
            expect(res.body[0].sportingEventID.toString()).toEqual(this.sportingEvent._id.toString());
            expect(res.body[0].tags.toString()).toEqual('championship game');
            done();
          });
      });

      it('should return a 401 when no token is provided', done => {
        request.get(`${url}/api/games`)
          .set({
            Authorization: `Bearer `,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });


      describe('PUT: /api/game/:gameId', () => {
        it('should update and return a game with a 200 status', done => {
          request.put(`${url}/api/game/${this.game._id}`)
            .send({ tags: 'new tag'})
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(200);
              expect(res.body.tags.toString()).toEqual('new tag');
              done();
            });
        });

        it('should  not update and return a 401 status', done => {
          request.put(`${url}/api/game/${this.game._id}`)
            .send({ loser: this.team2._id, winner: this.team1._id, homeScore: 70, awayScore: 67 })
            .set({
              Authorization: `Bearer `,
            })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });

        it('should  not update and return a 404 status for game not found', done => {
          request.put(`${url}/api/game/a`)
            .send({ loser: this.team2._id, winner: this.team1._id, homeScore: 70, awayScore: 67 })
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(404);
              done();
            });
        });
        it('should  not update and return a 400 status for game not found', done => {
          request.put(`${url}/api/game/a`)
            .send({nothing: 'nothing'})
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(400);
              done();
            });
        });


        describe('POST: /api/games/:sportingEventID', () => {

          it('should return a games and a 200 status', done => {
            request.post(`${url}/api/games/${this.sportingEvent._id}`)
              .send()
              .set({
                Authorization: `Bearer ${this.mock.token}`,
              })
              .end((err, res) => {
                if(err) return done(err);
                expect(res.status).toEqual(200);
                done();
              });
          });
        });
      });
    });
  });
});