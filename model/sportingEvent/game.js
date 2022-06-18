'use strict';

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema ({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'team' },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'team' },
  dateTime: { type: Date, required: true },
  weight: { type: Number, default: 1 },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  status: { type: String, default: 'scheduled' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'team', default: null },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: 'team', default: null },
  sportingEventID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'sportingEvent' },
  tags: [ String ],
});

module.exports = mongoose.model('gameSchema', gameSchema);