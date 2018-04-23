'use strict';

const { Router, json } = require('express');

const debug = require('debug')('bracketbusters:auth-router');
const createError = require('http-errors');
const basicAuth = require('../../lib/basic-auth-middleware.js');
const bearerAuth = require('../../lib/bearer-auth-middleware');
const User = require('../../model/user/user.js');
const Profile = require('../../model/user/profile.js');

const authRouter = module.exports = Router();

// http POST :3000/api/signup username=briguy999 email=brianbixby0@gmail.com password=password1
authRouter.post('/api/signup', json(), (req, res, next) => {
  debug('POST: /api/signup');
  const { username, password, email } = req.body;
  const message = !username ? 'expected a username'
    : !password ? 'expected a password'
      : !email ? 'expected an email'
        : null;

  if (message) return next(createError(400, message));

  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( myUser => {
      user = myUser;
      return new Profile({userID: user._id, username: user.username}).save();
    })
    .then( () => user.generateToken())
    .then( token => {
      res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
      res.send(token);
    })
    .catch(next);
});

// http -a briguy999:password1 :3000/api/signin
authRouter.get('/api/signin', basicAuth, (req, res, next) => {
  debug('GET: /api/signin');

  let currentUser = User.findOne({ username: req.auth.username})
    .then(user => {
      if(!user) throw createError(401);
      return currentUser = user;
    })
    .then( user => user.comparePasswordHash(req.auth.password))
    .then( user => user.generateToken())
    .then( token => {
      return Profile.findOne({ userID: currentUser._id })
        .then( profile => {
          profile.lastLogin = new Date();
          profile.save();
          res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
          res.send(token);
        });
    })
    .catch(next);
});

authRouter.get('/api/signup/usernames/:username', (req, res, next) => {
  User.findOne({username: req.params.username})
    .then(user => {
      if(!user)
        return res.sendStatus(200);
      return res.sendStatus(409);
    })
    .catch(next);
});

authRouter.get('/api/signin/token', bearerAuth, (req, res, next) => {
  debug('GET: /api/signin/token');

  let currentUser = User.findById(req.user._id)
    .then(user => {
      if(!user) throw createError(401);
      return currentUser = user;
    })
    .then( user => user.generateToken())
    .then( token => {
      return Profile.findOne({ userID: currentUser._id })
        .then( profile => {
          profile.lastLogin = new Date();
          profile.save();
          res.cookie('Bracket-Busters-Token', token, {maxAge: 604800000});
          res.send(token);
        });
    })
    .catch(next);
});