'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  username: {type: String, required: true },
  image: String,
  messageBoardID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'messageBoard' },
  content: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  tags: [ String ],
});

module.exports = mongoose.model('comment', commentSchema);