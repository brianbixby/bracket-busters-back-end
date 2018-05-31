'use strict';

const request = require('superagent');
const User = require('../model/user/user.js');
const fakeUser  = require('./lib/fakeUser.js');
const fakeProfile  = require('./lib/fakeProfile.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const url = 'http://localhost:3000';
const testUser = {
  username: 'testUserName',
  email: 'testEmail',
  password: 'testPassword',
};
const incompleteTestUser = {
  email: 'testEmail',
  password: 'testPassword',
};
let oldToken;

describe('Auth routes', function() {
  beforeAll( done => serverToggle.serverOn(server, done));
  afterAll( done => serverToggle.serverOff(server, done));
  describe('POST: /api/signup', function() {
    describe('with a valid body', () => {
      afterEach(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });

      it('should return a token', done => { 
        request.post(`${url}/api/signup`)
          .send(testUser)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });
    describe('with an invalid body', function() {
      beforeEach( done => {
        return fakeUser.create()
          .then(mock => {
            this.mock = mock;
            return done();
          })
          .catch(done);
      });
      afterEach(done => {
        return Promise.all([
          fakeUser.remove(),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should return a 400 error, incomplete req.body fields', done => {
        request.post(`${url}/api/signup`)
          .send(incompleteTestUser)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });
  });

  describe('functions that need a fake profile', () => {
    beforeEach(done => {
      return fakeProfile.create()
        .then(mock => {
          this.mock = mock;
          return done();
        });
    });
    afterEach(done => {
      return Promise.all([
        fakeProfile.remove(),
      ])
        .then(() => done())
        .catch(done);
    });

    describe('GET: /api/signup/usernames/:username', () => {
      describe('with a taken username', () => {
        it('should return a 409 status', done => { 
          request.get(`${url}/api/signup/usernames/${this.mock.requestUser.username}`)
            .end((err, res) => {
              expect(res.status).toEqual(409);
              done();
            });
        });
      });
      describe('with a not taken username', () => {
        it('should return a 200 status', done => { 
          request.get(`${url}/api/signup/usernames/ewbewbrewbewbreb32t324532532532532523tdsberbnerhberslwealggweasdgewgbewgbewgb32532`)
            .send(testUser)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(200);
              done();
            });
        });
      });
    });
    describe('GET: /api/signin', () => {
      describe('with a valid body', () => {
        it('should return a token', done => {
          request.get(`${url}/api/signin`)
            .auth(this.mock.requestUser.username, this.mock.requestUser.password)
            .end((err, res) => {
              if(err) return done(err);
              expect(res.status).toEqual(200);
              expect(typeof res.text).toEqual('string');
              done();
            });
        });
        it('should return a 401 when user cant be authenticated', done => {
          request.get(`${url}/api/signin`)
            .auth('fakeuser', 'fakepassword')
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
    describe('GET: /api/signin/token', () => {
      describe('with a valid body', () => {
        it('should return a token', done => {
          oldToken = this.mock.token;
          request.get(`${url}/api/signin/token`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .end((err, res) => {
              if(err) return done(err);
              expect(res.status).toEqual(200);
              expect(typeof res.text).toEqual('string');
              done();
            });
        });
        it('should return a 401 when user cant be authenticated', done => {
          request.get(`${url}/api/signin/token`)
            .set({
              Authorization: `Bearer ${oldToken}`,
            })
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
  });
});