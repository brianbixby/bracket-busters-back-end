'use strict';

const request = require('superagent');
const faker = require('faker');
const fakeProfile = require('./lib/fakeProfile.js');
const Group = require('../model/league/group.js');
const MessageBoard = require('../model/league/messageBoard.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

let exampleGroup = {
  groupName: faker.company.companyName(),
  privacy: 'public',
  owner: this.mock.profile._id,
  users: [this.mock.profile._id],
};

describe('Message Board Routes', function () {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });
  afterAll(done => {
    serverToggle.serverOff(server, done);
  });
  beforeEach( () => {
    return fakeProfile.create()
      .then( mock => {
        this.mock = mock;
        return this.mock.profile = this.mock.profile._rejectionHandler0;
      });
  }); 
  beforeEach(done => {

    new Group(exampleGroup).save()
      .then(group => {
        this.tempGroup = group;
        done();
      })
      .catch(done);
  });
  beforeEach(done => {
    MessageBoard.findOne({ groupID: this.tempGroup._id })
      .then(messageBoard => {
        this.tempMessageBoard = messageBoard;
      })
      .catch(done);
  });
  afterEach(done => {
    Promise.all([
      fakeProfile.remove,
      Group.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });

  describe('GET: /api/messageboard/:messageBoardId', () => {
    describe('with valid messageBoardId', () => {
      it('should give 200 response code', done => {
        request.get(`${url}/api/messageboard/${this.tempMessageBoard._id}`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.groupName).toEqual(exampleGroup.groupName);
            expect(res.body.privacy).toEqual(exampleGroup.privacy);
            expect(res.body.owner).toEqual(exampleGroup.owner);
            expect(res.body.users).toEqual(exampleGroup.users);
            done();
          });
      });
    });

    // describe('with an invalid token', () => {
    //   it('should return a 401 error', done => {
    //     request.get(`${url}/api/messageboard/${this.tempMessageBoard._id}`)
    //       .set({
    //         Authorization: `Bearer `,
    //       })
    //       .end((err, res) => {
    //         expect(res.status).toEqual(401);
    //         done();
    //       });
    //   });
    // });
  });
});