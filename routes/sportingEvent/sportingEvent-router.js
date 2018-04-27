'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:profile-router');
const createError = require('http-errors');

const SportingEvent = require('../../model/sportingEvent/sportingEvent.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const sportingEventRouter = module.exports = Router();

// create a sporting event
// http POST :3000/api/sportingEvent 'Authorization:Bearer TOKEN' sportingEventName='a' desc='a'
sportingEventRouter.post('/api/sportingevent', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/sportingEvent');

  const { sportingEventName, desc } = req.body;
  const message = !sportingEventName ? 'expected a sportingEventName'
    : !desc ? 'expected a desc'
      : null;
  
  if (message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));
  
  new SportingEvent(req.body).save()
    .then( sportingEvent => res.json(sportingEvent))
    .catch(next);
});