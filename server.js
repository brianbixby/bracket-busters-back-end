'use strict';

require('dotenv').load();
const express = require('express');
const debug = require('debug')('bracketbusters:server');

const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const allRoutes = require('./routes/allRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

// app.use(cors());
app.use(cors({credentials: true, origin: process.env.CORS_ORIGINS}));
app.use(morgan('dev'));
app.use(allRoutes);

const server = module.exports = app.listen(PORT, () => {
  debug(`bracket busters is running on: ${PORT}`);
});

server.isRunning = true;