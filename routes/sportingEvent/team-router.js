'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:team-router');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const teamRouter = module.exports = Router();

teamRouter.post('/api/sportingevent/:sportingEventId/team', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/team');

  if (!req.body.teamName) return next(createError(400, 'expected a request body teamName'));
  req.body.sportingEventID = req.params.sportingEventId;
  new Team(req.body).save()
    .then( team => res.json(team))
    .catch(next);
});

teamRouter.put('/api/team/:teamId', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/team:teamId');
  
  if (!req.body.teamName) return next(createError(400, 'expected a request body teamName'));
  Team.findByIdAndUpdate(req.params.teamId, req.body, {new:true})
    .then( team => res.json(team))
    .catch(next);
});

teamRouter.get('/api/team/:teamId', bearerAuth, (req, res, next) => {
  debug('GET: /api/team/:teamId');

  Team.findById(req.params.teamId)
    .then( team => res.json(team))
    .catch(next);
});

teamRouter.get('/api/team', bearerAuth, (req, res, next) => {
  debug('GET: /api/team');

  Team.find()
    .then(teams => res.json(teams))
    .catch(next);
});