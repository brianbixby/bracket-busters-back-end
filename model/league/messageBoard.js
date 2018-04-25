'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const debug = require('debug')('bracketbusters:messageBoard');
const createError = require('http-errors');
const Comment = require('./comment.js');

const messageBoardSchema = mongoose.Schema({
  leagueID: { type: mongoose.Schema.Types.ObjectId, ref: 'league' },
  groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'group' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  tags: [ String ],
});

const MessageBoard = module.exports = mongoose.model('messageBoard', messageBoardSchema);

MessageBoard.findByIdAndAddComment = function(id, comment) {
  debug('findbyidandaddcomment');

  return new Comment(comment).save()
    .then(newComment => {
      return MessageBoard.findByIdAndUpdate(id, { $push: { comments: newComment._id }})
        .then(() => newComment)
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .catch( err => Promise.reject(createError(404, err.message)));
};