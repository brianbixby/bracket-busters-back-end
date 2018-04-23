'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:profile-router');
const createError = require('http-errors');

const Profile = require('../../model/user/profile.js');
const User = require('../../model/user/user.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const profileRouter = module.exports = Router();

profileRouter.get('/api/profile/:profileId', bearerAuth, (req, res, next) => {
  debug('GET: /api/profile/:profileId');

  Profile.findById(req.params.profileId)
    .then(profile => {
      if(!profile) throw createError(401);
      res.json(profile);
    })
    .catch(next);
});

// http PUT :3000/api/profile/:profileId 'Authorization:Bearer TOKEN' username='new list name'
profileRouter.put('/api/profile/:profileId', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/profile:profileId');

  req.body.lastLogin = new Date();
  Profile.findByIdAndUpdate(req.params.profileId, req.body, { new: true }, { runValidators: true })
    .then( myProfile => {
      let usernameObj = {username: myProfile.username };
      return User.findByIdAndUpdate(myProfile.userID, usernameObj, {new: true}, { runValidators: true })
        .then(() => res.json(myProfile));
    })
    .catch(next);
});

profileRouter.get('/api/profiles/currentuser', bearerAuth, (req, res, next) => {
  Profile.findOne({userID: req.user._id})
    .then(profile => {
      if(!profile)
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
      res.json(profile);
    })
    .catch(next);
});