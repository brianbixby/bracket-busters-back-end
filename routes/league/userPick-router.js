'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('bracketbusters:userPick-router');
const createError = require('http-errors');

const UserPick = require('../../model/league/userPick.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const userPickRouter = module.exports = Router();



userPickRouter.get('/api/userpick/:userPickId', bearerAuth, function(req, res, next) {
  debug('GET: /api/userpick/:userPickId');

  UserPick.findById(req.params.userPickId).populate({path: 'gameID', select: 'homeTeam awayTeam', populate: {path: 'awayTeam homeTeam', select: 'teamName wins losses _id image'}})
    .then(userPick => res.json(userPick))
    .catch(next);
});


// retrieves all users picks in specific league
userPickRouter.get('/api/userpicks/:leagueID', bearerAuth, function(req, res, next) {
  debug('GET: /api/userpicks');

  UserPick.find({ leagueID: req.params.leagueID, userID: req.user._id }).populate({path: 'gameID', select: 'homeTeam awayTeam', populate: {path: 'awayTeam homeTeam', select: 'teamName wins losses _id image'}})
    .then(userPicks => res.json(userPicks))
    .catch(next);
});


// http POST :3000/api/league/5aaa8a2af2db6d1315d29347/userpick 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImNiZTQzODQwMTBiZmJjN2I2NDJiNTlkZTM1ZjgxMDE3NDhlMTA3MDJmNmU3NmExZWEzOGJmN2M3ZWY2NDUyODUiLCJpYXQiOjE1MjExMjU4Njd9.4p5DqkayofQHjCbHYzSDr8FPexGFcdtJCsM8gTc3maU' gameID='5aaa8ae6f2db6d1315d2934a' pick='5aa8c322091555739d8cb12c' gameTime='2018-03-16 23:37:52-0700'

userPickRouter.post('/api/league/:leagueId/userpick', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/league/:leagueId/userpick');
  if (!req.body.pick || !req.body.gameID || !req.body.gameTime ) return next(createError(400, 'expected a request body, gameID, pick and gametime'));

  req.body.userID = req.user._id;
  new UserPick(req.body).save()
    .then( userPick => res.json(userPick))
    .catch(next);
});

userPickRouter.put('/api/userpick/:userPickId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/userpick:userPickId');

  if (!req.body) return next(createError(400, 'expected a request body'));
  UserPick.findByIdAndUpdate(req.params.userPickId, req.body, {new: true})
    .then( userPick => res.json(userPick))
    .catch(next);
});