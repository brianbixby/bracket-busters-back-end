'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:league-router');
const createError = require('http-errors');

const League = require('../../model/league/league.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const ScoreBoard = require('../../model/league/scoreBoard.js');
const UserPick = require('../../model/league/userPick.js');
const Profile = require('../../model/user/profile.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const leagueRouter = module.exports = Router();


// http POST :3000/api/sportingevent/:sportingeventID/league 'Authorization:Bearer token' leagueName='aaaawfaaaaa' privacy='a' poolSize=0 scoring='regular'
leagueRouter.post('/api/sportingevent/:sportingeventID/league', bearerAuth, json(), (req, res, next) => {
  debug(`POST: /api/sportingevent/:sportingeventID/league`);

  const { leagueName, scoring, poolSize, privacy } = req.body;
  const message = !leagueName ? 'expected a leagueName'
    : !scoring ? 'expected a scoring'
      : !poolSize ? 'expected a poolSize'
        : !privacy ? 'expected privacy'
          : null;
  
  if (message)
    return next(createError(400, message));

  req.body.owner = req.user._id;
  req.body.ownerName = req.user.username;
  req.body.users = req.user._id;
  req.body.sportingEventID = req.params.sportingeventID;
 
  let league = new League(req.body).save()
    .then( myLeague => {
      league = myLeague;
      return new MessageBoard({ leagueID: league._id }).save()
        .catch(next);
    })
    .then(() => {
      let scoreboard = { leagueID: league._id, userID: req.user._id };
      if (!scoreboard.leagueID || !scoreboard.userID )
        return next(createError(400, 'expected a scoreboard leagueID and userID'));

      return new ScoreBoard(scoreboard).save()
        .catch(next);
    })
    .then(() => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }}).save()
        .then( () => res.json(league))
        .catch(next);
    })
    .catch(next);
});




// add user to private league
leagueRouter.post('/api/league/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/league/private/adduser');

  League.findOneAndUpdate({ leagueName: req.body.leagueName, password: req.body.password }, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true }).save()
    .then( league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id };
      if (!scoreboard.leagueID || !scoreboard.userID )
        return next(createError(400, 'expected a request body leagueID and userID'));

      return new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch(next);
    })
    .then( league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }}).save()
        .then( () => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// returns all leagues of logged in user, actually get route
leagueRouter.post('/api/leagues/user', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/leagues/user');

  League.find( { _id: { $in: req.body} } )
    .then(leagues => {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

leagueRouter.get('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  debug('GET: /api/league/:leagueID');

  League.findById(req.params.leagueID)
    .then( league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));
      res.json(league);
    })
    .catch(next);
});

leagueRouter.get('/api/leagues', bearerAuth, (req, res, next) => {
  debug('GET: /api/leagues');

  League.find()
    .then(leagues => {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

leagueRouter.get('/api/leagueNames/:leagueName', (req, res, next) => {
  debug('GET: /api/leagueNames/:leagueName');

  League.findOne({ leagueName: req.params.leagueName })
    .then( league => {
      if(!league) {
        return res.sendStatus(200);
      }
      return res.sendStatus(409);
    })
    .catch(next);
});

// returns all public leagues
leagueRouter.get('/api/leagues/allpublic', bearerAuth, (req, res, next) => {
  debug('GET: /api/leagues/allpublic');
  
  League.find({ privacy: 'public' })
    .then(leagues =>  {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

// http PUT :3000/api/league/:leagueID/adduser 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/league/:leagueID/adduser');

  League.findByIdAndUpdate(req.params.leagueID, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true }).save()
    .then( league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id };
      if (!scoreboard.leagueID || !scoreboard.userID )
        return next(createError(400, 'expected a request body leagueID and userID'));

      return new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch(next);
    })
    .then( league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }}).save()
        .then( () => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// http PUT :3000/api/league/:leagueID/removeuser 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/league/:leagueID/removeuser');

  League.findByIdAndUpdate(req.params.leagueID, { $pull: { users: req.user._id }, $inc: { size: -1 }}, { new: true }).save()
    .then( league => {
      return ScoreBoard.findOneAndRemove({ userID: req.user._id, leagueID: req.params.leagueID }).save()
        .then(() => league)
        .catch(next);
    })
    .then( league => {
      return UserPick.remove({ userID: req.user._id, leagueID: req.params.leagueID }).save()
        .then(() => league)
        .catch(next);
    })
    .then( league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $pull: { leagues: league._id }}).save()
        .then( () => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// http PUT :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/league/:leagueID');

  let leagueProperties = req.body.leagueName 
   || req.body.sportingEventID 
   || req.body.owner
   || req.body.ownerName 
   || req.body.scoring 
   || req.body.poolSize 
   || req.body.privacy
   || req.body.password 
   || req.body.password
   || req.body.winner
   || req.body.status
   || req.body.users
   || req.body.createdOn
   || req.body.size
   || req.body.paidUsers
   || req.body.tags;


  if (!leagueProperties)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body'));

  League.findById(req.params.leagueID)
    .then( league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));

      if(league.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      League.findByIdAndUpdate(req.params.leagueID, req.body, {new: true, runValidators: true}).save()
        .then( league => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// http DELETE :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.delete('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/league/:leagueID');

  League.findById(req.params.leagueID)
    .then( league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));

      if(league.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      Profile.Update({ userID: { '$in': league.users }}, { $pull: { leagues: req.params.leagueID }}, {multi: true}).save()
        .then(profile => console.log('array of updated ids: ', profile))
        .then( () => league.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});