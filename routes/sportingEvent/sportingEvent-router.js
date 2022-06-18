'use strict';

const { Router} = require('express');
const createError = require('http-errors');

const SportingEvent = require('../../model/sportingEvent/sportingEvent.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const sportingEventRouter = module.exports = Router();

// create a sporting event
// http POST :3000/api/sportingEvent 'Authorization:Bearer TOKEN' sportingEventName='a' desc='a'
sportingEventRouter.post('/api/sportingevent', bearerAuth, (req, res, next) => {
  const { sportingEventName, desc } = req.body;
  const message = !sportingEventName ? 'expected a sportingEventName'
    : !desc ? 'expected a desc'
      : null;
  
  if (message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));
  
  new SportingEvent(req.body).save()
    .then(sportingEvent => res.json(sportingEvent))
    .catch(next);
});

// fetch all sporting events
// http GET :3000/api/sportingevents 'Authorization:Bearer TOKEN'
sportingEventRouter.get('/api/sportingevents', (req, res, next) => {
  SportingEvent.find()
    .then(sportingEvents => {
      if(!sportingEvents)
        return next(createError(404, 'NOT FOUND ERROR: sportingEvents not found'));
      res.json(sportingEvents);
    })
    .catch(next);
});