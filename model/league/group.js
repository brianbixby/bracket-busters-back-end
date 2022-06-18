'use strict';

const mongoose = require('mongoose');
const MessageBoard = require('./messageBoard.js');
const Comment = require('./comment.js');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  privacy: { type: String, required: true },
  size: { type: Number, default: 1 },
  motto: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  image: String ,
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  ownerName: {type: String, required: true },
  password: String,
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  userNames: [{type: String}],
  tags: [ String ], 
});


groupSchema.pre('remove', function(next) {
  MessageBoard.findOne({ groupID: this._id })
    .then( messageBoard => {
      return Comment.remove({messageBoardID: messageBoard._id}).exec()
        .catch(next);
    })
    .then(() => {
      return MessageBoard.remove({groupID: this._id}).exec()
        .catch(next);
    })
    .then(() => next())
    .catch(next);
});

module.exports = mongoose.model('group', groupSchema);