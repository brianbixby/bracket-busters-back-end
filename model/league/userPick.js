'use strict';

const mongoose = require('mongoose');

const userPickSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  leagueID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'league' },
  gameID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'gameSchema' },
  pick: { type: mongoose.Schema.Types.ObjectId, ref: 'team' },
  correct: { type: Boolean, default: false },
  gameTime: { type: Date, required: true },
});

module.exports = mongoose.model('userPick', userPickSchema);