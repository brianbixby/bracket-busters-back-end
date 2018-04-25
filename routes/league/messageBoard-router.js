'use strict';

const Router = require('express').Router;
const debug = require('debug')('bracketbusters:messageBoard-router');
const createError = require('http-errors');

const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const messageBoardRouter = module.exports = Router();

// fetch a messageBoard by ID
// http GET :3000/api/messageboard/:messageBoardID 'Authorization:Bearer token'
messageBoardRouter.get('/api/messageboard/:messageBoardID', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/:messageBoardID');

  MessageBoard.findById(req.params.messageBoardID)
    .then( messageBoard => {
      if(!messageBoard)
        return next(createError(404, 'NOT FOUND ERROR: messageBoard not found'));
      res.json(messageBoard);
    })
    .catch(next);
});

// fetch messageBoard by league ID
// http GET :3000/api/messageboard/league/:leagueID 'Authorization:Bearer token'
messageBoardRouter.get('/api/messageboard/league/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/league/:leagueID');

  MessageBoard.find({ leagueID: req.params.leagueID })
    .then( messageBoard => {
      if(!messageBoard)
        return next(createError(404, 'NOT FOUND ERROR: messageBoard not found'));
      res.json(messageBoard);
    })
    .catch(next);
});

// fetch messageBoard by group ID
// http GET :3000/api/messageboard/group/:groupID 'Authorization:Bearer token'
messageBoardRouter.get('/api/messageboard/group/:groupID', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/group/:groupID');

  MessageBoard.find({ groupID: req.params.groupID })
    .then( messageBoard => {
      if(!messageBoard)
        return next(createError(404, 'NOT FOUND ERROR: messageBoard not found'));
      res.json(messageBoard);
    })
    .catch(next);
});

// fetch all messageBoards
// http GET :3000/api/messageboards 'Authorization:Bearer token'
messageBoardRouter.get('/api/messageboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboards');

  MessageBoard.find()
    .then(messageBoards => {
      if(!messageBoards)
        return next(createError(404, 'NOT FOUND ERROR: messageBoards not found'));
      res.json(messageBoards);
    })
    .catch(next);
});