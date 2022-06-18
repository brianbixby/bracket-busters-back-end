'use strict';

const { Router, json } = require('express');
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

// gets array of usernames and profile images for group
// http GET :3000/api/profiles/group 'Authorization:Bearer TOKEN'
profileRouter.post('/api/profiles/group', bearerAuth, (req, res, next) => {
  Profile.find({ userID: { $in: req.body }}).select('username image')
    .then(profiles => {
      if(!profiles)
        return next(createError(404, 'NOT FOUND ERROR: profiles not found'));
      res.json(profiles);
    })
    .catch(next);
});

// update profile
// http PUT :3000/api/profile/:profileID 'Authorization:Bearer TOKEN' username='new username'
profileRouter.put('/api/profile/:profileID', bearerAuth, (req, res, next) => {
  req.body.lastLogin = new Date();
  Profile.findByIdAndUpdate(req.params.profileID, req.body, {new: true, runValidators: true})
    .then(myProfile => {
      if(!myProfile)
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
        
      let usernameObj = {username: myProfile.username };
      User.findByIdAndUpdate(myProfile.userID, usernameObj, {runValidators: true})
        .then(() => res.json(myProfile))
        .catch(next);
    })
    .catch(next);
});