'use strict';

const Router = require('express').Router;
const debug = require('debug')('bracketbusters:messageBoard-router');

const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const messageBoardRouter = module.exports = Router();

messageBoardRouter.get('/api/messageboard/:messageBoardId', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/:messageBoardId');

  MessageBoard.findById(req.params.messageBoardId)
    .then( messageBoard => res.json(messageBoard))
    .catch(next);
});

// get messageBoard by league ID
messageBoardRouter.get('/api/messageboard/league/:leagueId', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/league/:leagueId');

  MessageBoard.find({ leagueID: req.params.leagueId })
    .then( messageBoard => res.json(messageBoard))
    .catch(next);
});

// get messageBoard by group ID
messageBoardRouter.get('/api/messageboard/group/:groupId', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboard/group/:groupId');

  MessageBoard.find({ groupID: req.params.groupId })
    .then( messageBoard => res.json(messageBoard))
    .catch(next);
});

messageBoardRouter.get('/api/messageboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboards');

  MessageBoard.find()
    .then(messageBoards => res.json(messageBoards))
    .catch(next);
});