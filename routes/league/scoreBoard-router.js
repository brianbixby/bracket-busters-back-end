'use strict';

const Router = require('express').Router;
const debug = require('debug')('bracketbusters:scoreBoard-router');
const createError = require('http-errors');

const ScoreBoard = require('../../model/league/scoreBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const scoreBoardRouter = module.exports = Router();

// fetch all scoreBoards by league ID
// http GET :3000/api/scoreboards/:leagueID 'Authorization:Bearer token'
scoreBoardRouter.get('/api/scoreboards/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards/:leagueID');
  
  ScoreBoard.find({ leagueID: req.params.leagueID }).populate({path: 'userID', select: 'username'}) 
    .sort('score')
    .then(scoreBoards =>  {
      if(!scoreBoards)
        return next(createError(404, 'NOT FOUND ERROR: scoreBoards not found'));
      res.json(scoreBoards);
    })
    .catch(next);
});

// fetch all scoreboards
// http GET :3000/api/scoreboards 'Authorization:Bearer token'
scoreBoardRouter.get('/api/scoreboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards');

  ScoreBoard.find()
    .then(scoreBoards => {
      if(!scoreBoards)
        return next(createError(404, 'NOT FOUND ERROR: scoreBoards not found'));
      res.json(scoreBoards);
    })
    .catch(next);
});