'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sportingEventSchema = Schema ({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model('sportingEvent', sportingEventSchema);