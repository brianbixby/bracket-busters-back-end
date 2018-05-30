'use strict';

const faker = require('faker');
const User = require('../../model/user/user.js');

module.exports = exports = {};

exports.create = () => {
  let mock = {};
  mock.request = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  let user = new User(mock.request);
  return user.generatePasswordHash(mock.request.password)
    .then(user => user.save())
    .then(user => {
      mock.user = user;
      return user;
    })
    .then(user => user.generateToken())
    .then(token => {
      mock.token = token;
      return mock;    
    })
    .catch(console.log);
};    
 
      
exports.remove = () =>  User.remove({});