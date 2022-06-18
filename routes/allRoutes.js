'use strict';

const Router = require('express').Router;

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

module.exports = new Router()
  .use([
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
  

