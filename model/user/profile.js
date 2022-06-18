'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');

const profileSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  username: {type: String, required: true },
  image: String,
  country: { type: String, uppercase: true },
  state: { type: String, uppercase: true },
  accountBalance: { type: Number, default: 0 },
  status: { type: String, default: 'active'},
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  leagues: [{type: mongoose.Schema.Types.ObjectId, ref: 'league'}],
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'group'}],
  tags: [ String ],
});

const Profile = module.exports = mongoose.model('profile', profileSchema);

Profile.findByuserIDAndAddLeague = function(uid, lid) {
  return Profile.findOneAndUpdate({ userID: uid }, { $push: { leagues: lid }}, {new: true})
    .catch( err => Promise.reject(createError(404, err.message)));
};