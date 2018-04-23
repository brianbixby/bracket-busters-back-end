'use strict';

const Router = require('express').Router;
const debug = require('debug')('bracketbusters:scoreBoard-router');

const ScoreBoard = require('../../model/league/scoreBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const scoreBoardRouter = module.exports = Router();

scoreBoardRouter.get('/api/scoreboards/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards/:leagueID');
  
  ScoreBoard.find({ leagueID: req.params.leagueID }).populate({path: 'userID', select: 'username'}) 
    .sort('score')
    .then(scoreBoards =>  {
      console.log('scoreboard: ', scoreBoards);
      res.json(scoreBoards);
    })
    .catch(next);
});

scoreBoardRouter.get('/api/scoreboard/:scoreBoardId', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboard/:scoreBoardId');

  ScoreBoard.findById(req.params.scoreBoardId)
    .then( scoreBoard => res.json(scoreBoard))
    .catch(next);
});

scoreBoardRouter.get('/api/scoreboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboards');

  ScoreBoard.find()
    .then(scoreboards => res.json(scoreboards))
    .catch(next);
});