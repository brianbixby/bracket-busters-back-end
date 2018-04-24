'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:comment-router');
const createError = require('http-errors');

const Comment = require('../../model/league/comment.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const commentRouter = module.exports = Router();
// http POST :3000/api/messageboard/:messageBoardId/comment 'Authorization:Bearer token' content='my content'
commentRouter.post('/api/messageboard/:messageBoardId/comment', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/messageboard/:messageBoardId/comment'); 

  if (!req.body.content) return next(createError(400, 'expected a request body userID and content'));
  req.body.userID = req.user._id;

  MessageBoard.findByIdAndAddComment(req.params.messageBoardId, req.body)
    .then(res.json)
    .catch(next);
});

// returns all comments for a messageboard, actually get
commentRouter.post('/api/comments/messageboard', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/comments/messageboard');
  console.log('req.body: ', req.body);
  Comment.find( { _id: { $in: req.body} } )
    .then(comments => {
      console.log('comments: ', comments);
      res.json(comments);
    })
    .catch(next);
});

commentRouter.get('/api/comment/:commentId', bearerAuth, (req, res, next) => {
  debug('GET: /api/comment/:commentId');

  Comment.findById(req.params.commentId)
    .then( comment => res.json(comment))
    .catch(next);
});

commentRouter.get('/api/comments', bearerAuth, (req, res, next) => {
  debug('GET: /api/comments');

  Comment.find()
    .then(comments => res.json(comments))
    .catch(next);
});