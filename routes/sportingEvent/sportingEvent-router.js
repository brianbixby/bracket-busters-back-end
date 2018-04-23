'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:profile-router');
const createError = require('http-errors');

const SportingEvent = require('../../model/sportingEvent/sportingEvent.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const sportingEventRouter = module.exports = Router();

// http POST :3000/api/sportingEvent 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjdjYWZmYTg1ZDlkZTM4YmM1ZTA5YjJhN2EyZWUyMzBiNWY0Y2ViM2UxYzM5MjE2YzNmMTUwNzUyZTVlMWUzMzMiLCJpYXQiOjE1MjA5MDQxNjB9.yhuxsiOaYoPtdCtYgGm8RHBjeQNfOIbSjbzCMSjIuQQ' sportingEventName='a' desc='a'
sportingEventRouter.post('/api/sportingevent', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/sportingEvent');

  if (!req.body.sportingEventName || !req.body.desc ) return next(createError(400, 'expected a request body name and desc'));
  new SportingEvent(req.body).save()
    .then( sportingEvent => res.json(sportingEvent))
    .catch(next);
});

sportingEventRouter.get('/api/sportingevent/:sportingEventId', bearerAuth, (req, res, next) => {
  debug('GET: /api/sportingEvent/:sportingEventId');

  SportingEvent.findById(req.params.sportingEventId)
    .then( sportingEvent => res.json(sportingEvent))
    .catch(next);
});

sportingEventRouter.get('/api/sportingevents', bearerAuth, (req, res, next) => {
  debug('GET: /api/sportingevents');

  SportingEvent.find()
    .then(sportingEvents => res.json(sportingEvents))
    .catch(next);
});