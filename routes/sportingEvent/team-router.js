'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:team-router');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const teamRouter = module.exports = Router();

// http POST :3000/api/sportingevent/:sportingEventId/team 'Authorization:Bearer TOKEN' teamName='team name'
teamRouter.post('/api/sportingevent/:sportingEventId/team', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/team');

  if (!req.body.teamName) return next(createError(400, 'expected a request body teamName'));
  req.body.sportingEventID = req.params.sportingEventId;
  new Team(req.body).save()
    .then( team => res.json(team))
    .catch(next);
});

// http GET :3000/api/:teamId 'Authorization:Bearer TOKEN'
teamRouter.get('/api/team/:teamId', bearerAuth, (req, res, next) => {
  debug('GET: /api/team/:teamId');

  Team.findById(req.params.teamId)
    .then( team => res.json(team))
    .catch(next);
});

// http GET :3000/api/team 'Authorization:Bearer TOKEN'
teamRouter.get('/api/team', bearerAuth, (req, res, next) => {
  debug('GET: /api/team');

  Team.find()
    .then(teams => res.json(teams))
    .catch(next);
});

// http PUT :3000/api/team/:teamId 'Authorization:Bearer TOKEN' tags='new tag'
teamRouter.put('/api/team/:teamId', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/team:teamId');
  
  if (!req.body.teamName) return next(createError(400, 'expected a request body teamName'));
  Team.findByIdAndUpdate(req.params.teamId, req.body, {new:true})
    .then( team => res.json(team))
    .catch(next);
});