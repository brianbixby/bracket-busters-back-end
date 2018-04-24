'use strict';

const Router = require('express').Router;
const debug = require('debug')('bracketbusters:scoreBoard-router');

const ScoreBoard = require('../../model/league/scoreBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const scoreBoardRouter = module.exports = Router();

// http GET :3000/api/scoreboards/:leagueID 'Authorization:Bearer token'
scoreBoardRouter.get('/api/scoreboards/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards/:leagueID');
  
  ScoreBoard.find({ leagueID: req.params.leagueID }).populate({path: 'userID', select: 'username'}) 
    .sort('score')
    .then(scoreBoards =>  res.json(scoreBoards))
    .catch(next);
});

// http GET :3000/api/scoreboard/:scoreBoardId 'Authorization:Bearer token'
scoreBoardRouter.get('/api/scoreboard/:scoreBoardId', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboard/:scoreBoardId');

  ScoreBoard.findById(req.params.scoreBoardId)
    .then( scoreBoard => res.json(scoreBoard))
    .catch(next);
});

// http GET :3000/api/scoreboards 'Authorization:Bearer token'
scoreBoardRouter.get('/api/scoreboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards');

  ScoreBoard.find()
    .then(scoreboards => res.json(scoreboards))
    .catch(next);
});