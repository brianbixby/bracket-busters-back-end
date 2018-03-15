'use strict';

const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
  groupName: { type: String, required: true },
  privacy: { type: String, required: true },
  size: { type: Number, default: 0 },
  motto: { type: String },
  createdOn: { type: Date, default: Date.now },
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  password: { type: String },
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  tags: [{type: String }], 
});

module.exports = mongoose.model('group', groupSchema);

