'use strict';

const faker = require('faker');
const Team = require('../../model/sportingEvent/team.js');
const sportingEventMockFactory = require('./fakeSportingEvent.js');
const fakeUser = require('./fakeUser.js');
const teamMockFactory = module.exports = {};

teamMockFactory.create = () => {
  let mock = {};
  mock.teamRequest = {
    teamName: faker.name.firstName(),
    seed: faker.random.number(),
    pretournamentRecord: faker.random.number() + ' - ' + faker.random.number(),
    color: faker.random.word(),
    image: faker.random.word(),
    teamCity: faker.random.word(),
  };

  return sportingEventMockFactory.create()
    .then(sportingEvent => {
      mock.sportingEvent = sportingEvent;
      mock.teamRequest.sportingEventID = sportingEvent._id;
      return new Team(mock.teamRequest).save();
    })
    .then(team => {
      mock.team = team;
      return fakeUser.create();
    })
    .then(mockObject => {
      mock.token = mockObject.token;
      mock.user = mockObject.user;
      return mock;
    });
};

teamMockFactory.remove = () => Promise.all([
  Team.remove({}),
  sportingEventMockFactory.remove({}),
  fakeUser.remove(),
]);