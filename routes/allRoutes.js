'use strict';

const Router = require('express').Router;
const morgan = require('morgan');
const cors = require('cors');

const bindResponseMethods = require('./../lib/bind-response-methods.js');
const leagueRouter = require('./league/league-router.js');
const groupRouter = require('./league/group-router.js');
const scoreBoardRouter = require('./league/scoreBoard-router.js');
const userPickRouter = require('./league/userPick-router.js');
const gameRouter = require('./sportingEvent/game-router.js');
const sportingEventsRouter = require('./sportingEvent/sportingEvent-router.js');
const teamRouter = require('./sportingEvent/team-router.js');
const authRouter = require('./user/auth-router.js');
const profileRouter = require('./user/profile-router.js');
const messageBoardRouter = require('./league/messageBoard-router.js');
const commentRouter = require('./league/comment-router.js');
const errors = require('./../lib/error-middleware.js');
const whitelist = [process.env.CORS_ORIGINS, process.env.CORS_ORIGINS2];
const corsOptionsDelegate = req => {
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    return { origin: true };
  }else{
    return { origin: false };
  }
};

module.exports = new Router()
  .use([
    // GLOBAL MIDDLEWARE
    // cors(),
    cors({
      credentials: true,
      corsOptionsDelegate,
    }),
    morgan('dev'),
    bindResponseMethods,
    // ROUTERS
    authRouter,
    profileRouter,
    sportingEventsRouter,
    gameRouter,
    teamRouter,
    leagueRouter,
    userPickRouter,
    scoreBoardRouter,
    groupRouter,
    messageBoardRouter,
    commentRouter,
    // ERROR HANDLERS
    errors,
  ]);
  

