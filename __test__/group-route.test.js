'use strict';

const request = require('superagent');
const faker = require('faker');
const fakeProfile = require('./lib/fakeProfile.js');
const Group = require('../model/league/group.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

let exampleGroup = {
  groupName: faker.company.companyName(),
  privacy: 'public',
  motto: 'example motto',
};
let examplePrivateGroup = {
  groupName: faker.company.companyName(),
  privacy: 'private',
  motto: 'example motto',
  password: 'password',
};

describe('Group Routes', function () {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });
  afterAll(done => {
    serverToggle.serverOff(server, done);
  });
  beforeEach( done => {
    return fakeProfile.create()
      .then( mock => {
        this.mock = mock;
        exampleGroup.owner = this.mock.profile.userID;
        exampleGroup.ownerName = this.mock.profile.username;
        exampleGroup.users = [this.mock.profile.userID];
        done();
      })
      .catch(done);
  });

  // POST TESTS START HERE

  describe('POST: /api/group', () => {
    describe('with valid body and token', () => {
      beforeEach(done => {
        new Group(exampleGroup).save()
          .then(group => {
            this.tempGroup = group;
            done();
          })
          .catch(done);
      });
      afterEach(done => {
        Promise.all([
          fakeProfile.remove(),
          Group.remove({}),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should give 200 status', done => {
        request.post(`${url}/api/group`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .send(exampleGroup)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.groupName).toEqual(exampleGroup.groupName);
            expect(res.body.privacy).toEqual(exampleGroup.privacy);
            done();
          });
      });
      describe('with invalid body', () => {
        it('should give 400 status', done => {
          request.post(`${url}/api/group`)
            .set({
              Authorization: `Bearer ${this.mock.token}`,
            })
            .send({ group: 'something' })
            .end((err, res) => {
              expect(res.status).toEqual(400);
              done();
            });
        });
      });
      describe('with valid body and no token', () => {
        it('should give 401 status', done => {
          request.post(`${url}/api/group`)
            .set({
              Authorization: `Bearer `,
            })
            .send(exampleGroup)
            .end((err, res) => {
              expect(res.status).toEqual(401);
              done();
            });
        });
      });
    });
  });


  describe('POST: /api/group/private/adduser', () => {
    describe('with valid body and token', () => {
      beforeEach(done => {
        examplePrivateGroup.owner = this.mock.profile.userID;
        examplePrivateGroup.ownerName = this.mock.profile.username;
        examplePrivateGroup.users = [this.mock.profile.userID];
        new Group(examplePrivateGroup).save()
          .then(group => {
            this.tempGroup = group;
            done();
          })
          .catch(done);
      });
      afterEach(done => {
        Promise.all([
          fakeProfile.remove(),
          Group.remove({}),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should give 200 status', done => {
        request.post(`${url}/api/group/private/adduser`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .send({ groupName: this.tempGroup.groupName, password: this.tempGroup.password })
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.groupName).toEqual(examplePrivateGroup.groupName);
            expect(res.body.privacy).toEqual(examplePrivateGroup.privacy);
            expect(res.body.motto).toEqual(examplePrivateGroup.motto);
            done();
          });
      });
    });
  });

  describe('POST: /api/groups/user', () => {
    describe('with valid body and token', () => {
      beforeEach(done => {
        new Group(exampleGroup).save()
          .then(group => {
            this.tempGroup = group;
            done();
          })
          .catch(done);
      });
      afterEach(done => {
        Promise.all([
          fakeProfile.remove(),
          Group.remove({}),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should give 200 status', done => {
        request.post(`${url}/api/groups/user`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .send([this.tempGroup._id])
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body[0].groupName).toEqual(exampleGroup.groupName);
            expect(res.body[0].privacy).toEqual(exampleGroup.privacy);
            expect(res.body[0].motto).toEqual(exampleGroup.motto);
            done();
          });
      });
      it('should give 404 status', done => {
        request.post(`${url}/api/groups/user`)
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

  describe('GET: /api/group/:groupId', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid groupId', () => {
      it('should give 200 response code', done => {
        request.get(`${url}/api/group/${this.tempGroup._id}`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.groupName).toEqual(exampleGroup.groupName);
            expect(res.body.privacy).toEqual(exampleGroup.privacy);
            expect(res.body.owner).toEqual(exampleGroup.owner.toString());
            expect(res.body.users.toString()).toEqual(exampleGroup.users.toString());
            done();
          });
      });
    });

    describe('with invalid groupId', () => {
      it('should give a 404 error', done => {
        request.get(`${url}/api/group/1`)
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
        request.get(`${url}/api/group/${this.tempGroup._id}`)
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

  describe('GET: /api/groups/all/public', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid groupId', () => {
      it('should give 200 response code', done => {
        request.get(`${url}/api/groups/all/public`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body[0].groupName).toEqual(exampleGroup.groupName);
            expect(res.body[0].privacy).toEqual(exampleGroup.privacy);
            expect(res.body[0].owner).toEqual(exampleGroup.owner.toString());
            expect(res.body[0].users.toString()).toEqual(exampleGroup.users.toString());
            done();
          });
      });
    });
    describe('with no token', () => {
      it('should give an error', done => {
        request.get(`${url}/api/groups/all/public`)
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

  describe('POST: /api/groups/top', () => {
    describe('with valid body and token', () => {
      beforeEach(done => {
        new Group(exampleGroup).save()
          .then(group => {
            this.tempGroup = group;
            done();
          })
          .catch(done);
      });
      afterEach(done => {
        Promise.all([
          fakeProfile.remove(),
          Group.remove({}),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should give 200 status', done => {
        request.post(`${url}/api/groups/top`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .send()
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body[0].groupName).toEqual(exampleGroup.groupName);
            expect(res.body[0].privacy).toEqual(exampleGroup.privacy);
            expect(res.body[0].motto).toEqual(exampleGroup.motto);
            done();
          });
      });
    });
  });

  describe('GET: /api/groupNames/:groupName', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid groupId', () => {
      it('should give 200 response code', done => {
        request.get(`${url}/api/groupNames/${this.tempGroup.groupName}wfqqfwqwf`)
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
        request.get(`${url}/api/groupNames/${this.tempGroup.groupName}`)
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

  // PUT TESTS START HERE

  describe('PUT: /api/group/:groupId', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid body and token', () => {
      it('should give 200 status', done => {
        request.put(`${url}/api/group/${this.tempGroup._id}`)
          .set({
            Authorization: `Bearer ${this.mock.token}`,
          })
          .send({ groupName: 'new group name' })
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.groupName).toEqual('new group name');
            done();
          });
      });
    });

    describe('with no body and valid token', () => {
      it('should give 400 status', done => {
        request.put(`${url}/api/group/${this.tempGroup._id}`)
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
        request.put(`${url}/api/group/${this.tempGroup._id}`)
          .set({
            Authorization: `Bearer `,
          })
          .send({ groupName: 'new group name' })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });

  describe('PUT: /api/group/:groupId/adduser', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid id and token', () => {
      it('should give 200 status', done => {
        request.put(`${url}/api/group/${this.tempGroup._id}/adduser`)
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

  describe('PUT: /api/group/:groupId/removeuser', () => {
    describe('with valid id and token', () => {
      beforeEach(done => {
        new Group(exampleGroup).save()
          .then(group => {
            this.tempGroup = group;
            done();
          })
          .catch(done);
      });
      afterEach(done => {
        Promise.all([
          fakeProfile.remove(),
          Group.remove({}),
        ])
          .then(() => done())
          .catch(done);
      });
      it('should give 200 status', done => {
        request.put(`${url}/api/group/${this.tempGroup._id}/removeuser`)
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

  // DELETE TESTS START HERE

  describe('DELETE: /api/group/:groupId', () => {
    beforeEach(done => {
      new Group(exampleGroup).save()
        .then(group => {
          this.tempGroup = group;
          done();
        })
        .catch(done);
    });
    afterEach(done => {
      Promise.all([
        fakeProfile.remove(),
        Group.remove({}),
      ])
        .then(() => done())
        .catch(done);
    });
    describe('with valid token', () => {
      it('should give 204 status', done => {
        request.delete(`${url}/api/group/${this.tempGroup._id}`)
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
        request.delete(`${url}/api/group/${this.tempGroup._id}`)
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
        request.delete(`${url}/api/group/123456`)
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