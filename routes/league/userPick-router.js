'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:userPick-router');
const createError = require('http-errors');

const UserPick = require('../../model/league/userPick.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const userPickRouter = module.exports = Router();

// http GET :3000/api/userpick/:userPickId 'Authorization:Bearer token'
userPickRouter.get('/api/userpick/:userPickId', bearerAuth, (req, res, next) => {
  debug('GET: /api/userpick/:userPickId');

  UserPick.findById(req.params.userPickId).populate({path: 'gameID', select: 'homeTeam awayTeam', populate: {path: 'awayTeam homeTeam', select: 'teamName wins losses _id image'}})
    .then(userPick => res.json(userPick))
    .catch(next);
});

// retrieves all users picks in specific league
// http GET :3000/api/userpicks/:leagueID 'Authorization:Bearer token'
userPickRouter.get('/api/userpicks/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/userpicks');

  UserPick.find({ leagueID: req.params.leagueID, userID: req.user._id }).populate({path: 'gameID', select: 'homeTeam awayTeam', populate: {path: 'awayTeam homeTeam', select: 'teamName wins losses _id image'}})
    .then(userPicks => res.json(userPicks))
    .catch(next);
});

// http POST :3000/api/league/:leagueId/userpick 'Authorization:Bearer token' gameID='gameID' pick='pickID' gameTime='2018-03-16 23:37:52-0700'
userPickRouter.post('/api/league/:leagueId/userpick', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/league/:leagueId/userpick');

  const { pick, gameID, gameTime } = req.body;
  const message = !pick ? 'expected a pick'
    : !gameID ? 'expected a gameID'
      : !gameTime ? 'expected an gameTime'
        : null;

  if (message) return next(createError(400, message));

  req.body.userID = req.user._id;
  new UserPick(req.body).save()
    .then( userPick => res.json(userPick))
    .catch(next);
});

// http PUT :3000/api/userpick/:userPickId 'Authorization:Bearer token' pick='pickID'
userPickRouter.put('/api/userpick/:userPickId', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/userpick:userPickId');

  if (!req.body) return next(createError(400, 'expected a request body'));

  let userPickProperties = req.body.userID 
  || req.body.leagueID 
  || req.body.gameID 
  || req.body.pick 
  || req.body.correct 
  || req.body.gameTime;

  if (!userPickProperties) return next(createError(400, 'expected a request body'));

  UserPick.findByIdAndUpdate(req.params.userPickId, req.body, {new: true})
    .then( userPick => res.json(userPick))
    .catch(next);
});