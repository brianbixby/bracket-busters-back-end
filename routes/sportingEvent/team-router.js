'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:team-router');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const teamRouter = module.exports = Router();

// create a new team
// http POST :3000/api/sportingevent/:sportingEventID/team 'Authorization:Bearer TOKEN' teamName='team name'
teamRouter.post('/api/sportingevent/:sportingEventID/team', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/team');

  if (!req.body.teamName)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body teamName'));

  req.body.sportingEventID = req.params.sportingEventID;
  new Team(req.body).save()
    .then( team => res.json(team))
    .catch(next);
});