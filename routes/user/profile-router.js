'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:profile-router');
const createError = require('http-errors');

const Profile = require('../../model/user/profile.js');
const User = require('../../model/user/user.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const profileRouter = module.exports = Router();

// get current users profile
// http GET :3000/api/profiles/currentuser 'Authorization:Bearer TOKEN'
profileRouter.get('/api/profiles/currentuser', bearerAuth, (req, res, next) => {
  Profile.findOne({userID: req.user._id})
    .then(profile => {
      if(!profile)
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
      res.json(profile);
    })
    .catch(next);
});

// update profile
// http PUT :3000/api/profile/:profileID 'Authorization:Bearer TOKEN' username='new username'
profileRouter.put('/api/profile/:profileID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/profile:profileID');

  req.body.lastLogin = new Date();
  Profile.findByIdAndUpdate(req.params.profileID, req.body, {new: true, runValidators: true})
    .then( myProfile => {
      let usernameObj = {username: myProfile.username };
      return User.findByIdAndUpdate(myProfile.userID, usernameObj, {runValidators: true})
        .then(() => res.json(myProfile))
        .catch(next);
    })
    .catch(next);
});