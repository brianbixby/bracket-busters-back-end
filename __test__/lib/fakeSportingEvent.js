'use strict';

const faker = require('faker');
const SportingEvent = require('../../model/sportingEvent/sportingEvent.js');

module.exports = exports = {};

exports.create = function() {
  let mock = {};
  mock.request = {
    sportingEventName: faker.random.word(),
    desc: faker.random.word(),
  };
  return new SportingEvent(mock.request)
    .then(sportingEvent => sportingEvent.save())
    .then(sportingEvent => {
      mock.sportingEvent = sportingEvent;
      return mock;
    })
    .catch(console.log);
};

exports.remove = function() {
  return SportingEvent.remove({});
};
 

