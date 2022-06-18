'use strict';

const { Router, json } = require('express');
const createError = require('http-errors');

const Comment = require('../../model/league/comment.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const commentRouter = module.exports = Router();

// create a comment
// http POST :3000/api/messageboard/:messageBoardID/comment 'Authorization:Bearer token' content='my content'
commentRouter.post('/api/messageboard/:messageBoardID/comment', bearerAuth, (req, res, next) => {
  if (!req.body.content)
    return next(createError(400, 'BAD REQUEST ERROR: expected request body content'));
    
  req.body.userID = req.user._id;
  req.body.username = req.user.username;
  req.body.messageBoardID = req.params.messageBoardID;

  MessageBoard.findByIdAndAddComment(req.params.messageBoardID, req.body)
    .then(res.json)
    .catch(next);
});

// fetches all comments for a messageboard by providing an array of comment ID's in the req.body
commentRouter.post('/api/comments/messageboard', bearerAuth, (req, res, next) => {
  Comment.find( { _id: { $in: req.body} } ).sort({ createdOn: -1 })
    .then(comments => {
      if(!comments)
        return next(createError(404, 'NOT FOUND ERROR: comments not found'));
      res.json(comments);
    })
    .catch(next);
});

// fetch a single comment by ID
// http GET :3000/api/comment/:commentID 'Authorization:Bearer token'
commentRouter.get('/api/comment/:commentID', bearerAuth, (req, res, next) => {
  Comment.findById(req.params.commentID)
    .then(comment => {
      if(!comment)
        return next(createError(404, 'NOT FOUND ERROR: comment not found'));
      res.json(comment);
    })
    .catch(next);
});

// fetches all comments
// http GET :3000/api/comments 'Authorization:Bearer token'
commentRouter.get('/api/comments', bearerAuth, (req, res, next) => {
  Comment.find()
    .then(comments => {
      if(!comments)
        return next(createError(404, 'NOT FOUND ERROR: comments not found'));
      res.json(comments);
    })
    .catch(next);
});