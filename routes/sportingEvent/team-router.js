'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:team-router');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const teamRouter = module.exports = Router();

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

// http GET :3000/api/:teamID 'Authorization:Bearer TOKEN'
teamRouter.get('/api/team/:teamID', bearerAuth, (req, res, next) => {
  debug('GET: /api/team/:teamID');

  Team.findById(req.params.teamID)
    .then( team => {
      if(!team)
        return next(createError(404, 'NOT FOUND ERROR: team not found'));
      res.json(team);
    })
    .catch(next);
});

// http GET :3000/api/team 'Authorization:Bearer TOKEN'
teamRouter.get('/api/team', bearerAuth, (req, res, next) => {
  debug('GET: /api/team');

  Team.find()
    .then(teams => {
      if(!teams)
        return next(createError(404, 'NOT FOUND ERROR: teams not found'));
      res.json(teams);
    })
    .catch(next);
});

// http PUT :3000/api/team/:teamID 'Authorization:Bearer TOKEN' tags='new tag'
teamRouter.put('/api/team/:teamID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/team:teamID');
  
  if (!req.body.teamName)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body teamName'));
    
  Team.findByIdAndUpdate(req.params.teamID, req.body, {new: true, runValidators: true})
    .then( team => res.json(team))
    .catch(next);
});