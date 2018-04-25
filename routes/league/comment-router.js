'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:comment-router');
const createError = require('http-errors');

const Comment = require('../../model/league/comment.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const commentRouter = module.exports = Router();
// http POST :3000/api/messageboard/:messageBoardID/comment 'Authorization:Bearer token' content='my content'
commentRouter.post('/api/messageboard/:messageBoardID/comment', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/messageboard/:messageBoardID/comment'); 

  if (!req.body.content)
    return next(createError(400, 'BAD REQUEST ERROR: expected request body content'));
    
  req.body.userID = req.user._id;

  MessageBoard.findByIdAndAddComment(req.params.messageBoardID, req.body)
    .then ( comment => res.json(comment))
    .catch(next);
});

// returns all comments for a messageboard, actually get
commentRouter.post('/api/comments/messageboard', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/comments/messageboard');

  Comment.find( { _id: { $in: req.body} } )
    .then(comments => {
      if(!comments)
        return next(createError(404, 'NOT FOUND ERROR: comments not found'));
      res.json(comments);
    })
    .catch(next);
});


commentRouter.get('/api/comment/:commentID', bearerAuth, (req, res, next) => {
  debug('GET: /api/comment/:commentID');

  Comment.findById(req.params.commentID)
    .then( comment => {
      if(!comment)
        return next(createError(404, 'NOT FOUND ERROR: comment not found'));
      res.json(comment);
    })
    .catch(next);
});

commentRouter.get('/api/comments', bearerAuth, (req, res, next) => {
  debug('GET: /api/comments');

  Comment.find()
    .then(comments => {
      if(!comments)
        return next(createError(404, 'NOT FOUND ERROR: comments not found'));
      res.json(comments);
    })
    .catch(next);
});