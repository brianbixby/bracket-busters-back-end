'use strict';

const mongoose = require('mongoose');
const MessageBoard = require('./messageBoard.js');
const Comment = require('./comment.js');

const groupSchema = mongoose.Schema({
  groupName: { type: String, required: true },
  privacy: { type: String, required: true },
  size: { type: Number, default: 1 },
  motto: String,
  createdOn: { type: Date, default: Date.now },
  image: String ,
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  ownerName: {type: String, required: true },
  password: String,
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  tags: [ String ], 
});


groupSchema.pre('remove', function(next) {
  MessageBoard.findOne({ groupID: this._id })
    .then( messageBoard => {
      Comment.remove({messageBoardID: messageBoard._id}).exec();
    })
    .catch(next);
  MessageBoard.remove({groupID: this._id}).exec();
  next();
});

module.exports = mongoose.model('group', groupSchema);


