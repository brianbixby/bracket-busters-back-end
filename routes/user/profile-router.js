'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('bracketbusters:profile-router');

const Profile = require('../../model/user/profile.js');
const User = require('../../model/user/user.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');
const createError = require('http-errors');

const profileRouter = module.exports = Router();


profileRouter.get('/api/profile/:profileId', bearerAuth, function (req, res, next) {
  debug('GET: /api/profile/:profileId');

  Profile.findById(req.params.profileId)
    .then(profile => res.json(profile))
    .catch(next);
});

// http PUT :3000/api/profile/5aaac0153bba352361732273 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImI2YmE0YTRkN2Y4NmI1YjZmNDAzMWQ3NjUwZjNiN2JhZGJjZTBlMjE4MTdjOWQ1MDk3NDhkZmU3ODNhY2YzYTMiLCJpYXQiOjE1MjExNDU0NzJ9.Y8qBhJlfLcTJpQH2MBoheZd2j8KDZT7-KM3rQgYV0uM' name='new list name' state='wa' 
profileRouter.put('/api/profile/:profileId', bearerAuth, jsonParser, function (req, res, next) {
  debug('PUT: /api/profile:profileId');

  req.body.lastLogin = new Date();
  Profile.findByIdAndUpdate(req.params.profileId, req.body, { new: true })
    .then( myProfile => {
      let usernameObj = {username: myProfile.username };
      return User.findByIdAndUpdate(myProfile.userID, usernameObj, {new: true})
        .then(() => myProfile)
        .catch(next);
    })
    .then(profile => res.json(profile))
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