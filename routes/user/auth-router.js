'use strict';

const { Router } = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');

const basicAuth = require('../../lib/basic-auth-middleware.js');
const bearerAuth = require('../../lib/bearer-auth-middleware');
const User = require('../../model/user/user.js');
const Profile = require('../../model/user/profile.js');

const authRouter = module.exports = Router();

// create a user account
// http POST :3000/api/signup username=username email=email@gmail.com password=password
authRouter.post('/api/signup',  (req, res, next) => {
  const { username, password, email } = req.body;
  const message = !username ? 'expected a username'
    : !password ? 'expected a password'
      : !email ? 'expected an email'
        : null;

  if(message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));

  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then(user => user.save())
    .then(myUser => {
      user = myUser;
      return new Profile({userID: user._id, username: user.username}).save();
    })
    .then(() => user.generateToken())
    .then(token => {
      res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
      res.send(token);
    })
    .catch(next);
});

// signin to a user account
// http -a username:password :3000/api/signin
authRouter.get('/api/signin', basicAuth, (req, res, next) => {
  let currentUser = User.findOne({ username: req.auth.username})
    .then(user => {
      if(!user)
        return next(createError(401, 'UNAUTHORIZED ACCESS ERROR: invalid credentials'));
      return currentUser = user;
    })
    .then(user => user.comparePasswordHash(req.auth.password))
    .then(user => user.generateToken())
    .then(token => {
      Profile.findOne({ userID: currentUser._id })
        .then(profile => {
          profile.lastLogin = new Date();
          return profile.save();
        })
        .then(() => {
          res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
          res.send(token);
        })
        .catch(next);
    })
    .catch(next);
});

// token signin, validates token and keeps users signedin
authRouter.get('/api/signin/token', bearerAuth, (req, res, next) => {
  let currentUser = User.findById(req.user._id)
    .then(user => {
      if(!user)
        return next(createError(401, 'UNAUTHORIZED ACCESS ERROR: invalid credentials'));
      return currentUser = user;
    })
    .then(user => user.generateToken())
    .then(token => {
      Profile.findOne({ userID: currentUser._id })
        .then( profile => {
          profile.lastLogin = new Date();
          return profile.save();
        })
        .then(() => {
          res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
          res.send(token);
        })
        .catch(next);
    })
    .catch(next);
});

// username availability check
// http GET :3000/api/signup/usernames/username
authRouter.get('/api/signup/usernames/:username', (req, res, next) => {
  User.findOne({username: req.params.username})
    .then(user => {
      if(!user)
        return res.sendStatus(200);
      return res.sendStatus(409);
    })
    .catch(next);
});