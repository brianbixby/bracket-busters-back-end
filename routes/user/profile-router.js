'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:profile-router');
const createError = require('http-errors');

const Profile = require('../../model/user/profile.js');
const User = require('../../model/user/user.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const profileRouter = (module.exports = Router());

// get current users profile
// http GET :3000/api/profiles/currentuser 'Authorization:Bearer TOKEN'
profileRouter.get(
  '/api/profiles/currentuser',
  bearerAuth,
  async (req, res, next) => {
    try {
      Profile.findOne({ userID: req.user._id });
      if (!profile)
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
      const profileCurrentUser = await res.json(profile);
    } catch (next) {
      console.log(next);
    }
  }
);

// update profile
// http PUT :3000/api/profile/:profileID 'Authorization:Bearer TOKEN' username='new username'
profileRouter.put(
  '/api/profile/:profileID',
  bearerAuth,
  json(),
  async (req, res, next) => {
    try {
      debug('PUT: /api/profile:profileID');
      req.body.lastLogin = new Date();

      const findProfileIDThenUpdate = await Profile.findByIdAndUpdate(
        req.params.profileID,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      if (!findProfileIDThenUpdate) {
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
      }
      const myProfile = await { username: findProfileIDThenUpdate.username };
      User.findByIdAndUpdate(findProfileIDThenUpdate.userID, usernameObj, {
        runValidators: true
      });
      const resolving = await res.json(myProfile);
    } catch (next) {
      console.log(next);
    }
  }
);
