'use strict';

const { Router } = require('express');
const createError = require('http-errors');

const UserPick = require('../../model/league/userPick.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const userPickRouter = module.exports = Router();

// creates a userpick specific to a user, game and league
// http POST :3000/api/league/:leagueID/userpick 'Authorization:Bearer token' gameID='gameID' pick='pickID' gameTime='2018-03-16 23:37:52-0700'
userPickRouter.post('/api/league/:leagueID/userpick', bearerAuth, (req, res, next) => {
  const { pick, gameID, gameTime } = req.body;
  const message = !pick ? 'expected a pick'
    : !gameID ? 'expected a gameID'
      : !gameTime ? 'expected an gameTime'
        : null;

  if (message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));

  req.body.userID = req.user._id;
  new UserPick(req.body).save()
    .then( userPick => res.json(userPick))
    .catch(next);
});

// fetches a userpick by ID
// http GET :3000/api/userpick/:userPickID 'Authorization:Bearer token'
userPickRouter.get('/api/userpick/:userPickID', bearerAuth, (req, res, next) => {
  UserPick.findById(req.params.userPickID).populate({path: 'gameID', select: 'status winner loser homeTeam awayTeam homeScore awayScore', populate: {path: 'awayTeam homeTeam', select: 'teamName teamCity image color wins losses'}})
    .then(userPick => {
      if(!userPick)
        return next(createError(404, 'NOT FOUND ERROR: userPick not found'));
      res.json(userPick);
    })
    .catch(next);
});

// status winner loser
// retrieves all users picks in specific league for a user
// http GET :3000/api/userpicks/:leagueID 'Authorization:Bearer token'
userPickRouter.get('/api/userpicks/:leagueID', bearerAuth, (req, res, next) => {
  UserPick.find({ leagueID: req.params.leagueID, userID: req.user._id }).populate({path: 'gameID', select: 'status winner loser homeTeam awayTeam homeScore awayScore', populate: {path: 'awayTeam homeTeam', select: 'teamName teamCity image color wins losses'}}).sort({ gameTime: -1 })
    .then(userPicks => {
      if(!userPicks)
        return next(createError(404, 'NOT FOUND ERROR: userPicks not found'));
      res.json(userPicks);
    })
    .catch(next);
});

// updates a user pick
// http PUT :3000/api/userpick/:userPickID 'Authorization:Bearer token' pick='pickID'
userPickRouter.put('/api/userpick/:userPickID', bearerAuth, (req, res, next) => {
  let userPickProperties = req.body.userID 
  || req.body.leagueID 
  || req.body.gameID 
  || req.body.pick 
  || req.body.correct 
  || req.body.gameTime;

  if (!userPickProperties)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body'));

  UserPick.findByIdAndUpdate(req.params.userPickID, req.body, {new: true, runValidators: true})
    .then( userPick => res.json(userPick))
    .catch(next);
});