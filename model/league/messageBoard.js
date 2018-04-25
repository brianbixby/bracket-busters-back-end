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

  return MessageBoard.findById(id)
    .then( messageBoard => {
      comment.messageBoardID = messageBoard._id;
      this.tempMessageBoard = messageBoard;
      return new Comment(comment).save()
        .catch(next);
    })
    .then( comment => {
      return this.tempMessageBoard.comments.push(comment._id)
        .then(() => {
          this.tempComment = comment;
          return this.tempMessageBoard.save()
            .catch(next);
        })
        .catch(next);
    })
    .then(() => res.json(this.tempComment))
    .catch( err => Promise.reject(createError(404, err.message)));
};