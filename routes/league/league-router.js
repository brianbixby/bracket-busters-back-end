'use strict';

const { Router } = require('express');
const createError = require('http-errors');

const League = require('../../model/league/league.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const ScoreBoard = require('../../model/league/scoreBoard.js');
const UserPick = require('../../model/league/userPick.js');
const Profile = require('../../model/user/profile.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const leagueRouter = module.exports = Router();

// creates a league
// http POST :3000/api/sportingevent/:sportingeventID/league 'Authorization:Bearer token' leagueName='aaaawfaaaaa' privacy='a' poolSize=0 scoring='regular'
leagueRouter.post('/api/sportingevent/:sportingeventID/league', bearerAuth, (req, res, next) => {
  const { leagueName, privacy } = req.body;
  const message = !leagueName ? 'expected a leagueName'
    : !privacy ? 'expected privacy'
      : null;
  
  if (message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));

  req.body.owner = req.user._id;
  req.body.ownerName = req.user.username;
  req.body.users = req.user._id;
  req.body.sportingEventID = req.params.sportingeventID;
 
  let league = new League(req.body).save()
    .then(myLeague => {
      league = myLeague;
      return new MessageBoard({ leagueID: league._id }).save()
        .catch(next);
    })
    .then(() => {
      let scoreboard = { leagueID: league._id, userID: req.user._id, sportingEventID: league.sportingEventID };
      if (!scoreboard.leagueID || !scoreboard.userID || !scoreboard.sportingEventID)
        return next(createError(400, 'BAD REQUEST ERROR: expected a scoreboard leagueID, sportingEventID and userID'));

      return new ScoreBoard(scoreboard).save()
        .catch(next);
    })
    .then(() => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }})
        .then(() => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// add user to private league, actually put route
// http POST :3000/api/league/private/adduser 'Authorization:Bearer token leagueName='leaguename' password='password'
leagueRouter.post('/api/league/private/adduser', bearerAuth, (req, res, next) => {
  League.findOneAndUpdate({ leagueName: req.body.leagueName, password: req.body.password }, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true })
    .then(league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id, sportingEventID: league.sportingEventID };
      if (!scoreboard.leagueID || !scoreboard.userID || !scoreboard.sportingEventID)
        return next(createError(400, 'BAD REQUEST ERROR: expected a scoreboard leagueID, sportingEventID and userID'));

      new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch(next);
    })
    .then(league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }})
        .then(() => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// fetches all leagues of a logged in user, actually get route
// http GET :3000/api/leagues/user 'Authorization:Bearer token'
leagueRouter.post('/api/leagues/user', bearerAuth, (req, res, next) => {
  League.find( { _id: { $in: req.body} } )
    .then(leagues => {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

// fetches all public leagues logged in user is not in
// http GET :3000/api/leagues/user 'Authorization:Bearer token'
leagueRouter.post('/api/leagues/top/:sportingEventID', bearerAuth, (req, res, next) => {
  League.find( { sportingEventID: req.params.sportingEventID, privacy: 'public', _id: { $nin: req.body[0] }}).limit(10).sort({ size: -1 })
    .then(leagues => {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

// fetches a league by ID
// http GET :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.get('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  League.findById(req.params.leagueID)
    .then(league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));
      res.json(league);
    })
    .catch(next);
});

// fetches all public leagues
// http GET :3000/api/leagues/allpublic 'Authorization:Bearer token'
leagueRouter.get('/api/leagues/allpublic', bearerAuth, (req, res, next) => {
  League.find({ privacy: 'public' })
    .then(leagues =>  {
      if(!leagues)
        return next(createError(404, 'NOT FOUND ERROR: leagues not found'));
      res.json(leagues);
    })
    .catch(next);
});

// league name availability check
// http GET :3000/api/leagueNames/:leagueName
leagueRouter.get('/api/leagueNames/:leagueName', (req, res, next) => {
  League.findOne({ leagueName: req.params.leagueName })
    .then(league => {
      if(!league)
        return res.sendStatus(200);
      return res.sendStatus(409);
    })
    .catch(next);
});

// add a user to a league
// http PUT :3000/api/league/:leagueID/adduser 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID/adduser', bearerAuth, (req, res, next) => {
  League.findByIdAndUpdate(req.params.leagueID, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true })
    .then(league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id, sportingEventID: league.sportingEventID };
      if (!scoreboard.leagueID || !scoreboard.userID || !scoreboard.sportingEventID)
        return next(createError(400, 'BAD REQUEST ERROR: expected a scoreboard leagueID, sportingEventID and userID'));

      return new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch(next);
    })
    .then(league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { leagues: league._id }})
        .then(() => {
          return res.json(league);
        })
        .catch(next);
    })
    .catch(next);
});

// remove a user from a league
// http PUT :3000/api/league/:leagueID/removeuser 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID/removeuser', bearerAuth, (req, res, next) => {
  League.findByIdAndUpdate(req.params.leagueID, { $pull: { users: req.user._id }, $inc: { size: -1 }}, { new: true })
    .then(league => {
      ScoreBoard.findOneAndRemove({ userID: req.user._id, leagueID: req.params.leagueID })
        .then(() => league)
        .catch(next);
    })
    .then(league => {
      UserPick.remove({ userID: req.user._id, leagueID: req.params.leagueID })
        .then(() => league)
        .catch(next);
    })
    .then(league => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $pull: { leagues: league._id }})
        .then(() => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// updates a league's settings
// http PUT :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  let leagueProperties = req.body.leagueName 
   || req.body.sportingEventID 
   || req.body.owner
   || req.body.ownerName 
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
    .then(league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));

      if(league.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      League.findByIdAndUpdate(req.params.leagueID, req.body, {new: true, runValidators: true})
        .then(league => res.json(league))
        .catch(next);
    })
    .catch(next);
});

// delete a league
// http DELETE :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.delete('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  League.findById(req.params.leagueID)
    .then(league => {
      if(!league)
        return next(createError(404, 'NOT FOUND ERROR: league not found'));

      if(league.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      Profile.update({ userID: { '$in': league.users }}, { $pull: { leagues: req.params.leagueID }}, {multi: true})
        // PRE hook in league model to delete the comments, message board, scoreboard and userpicks first
        .then(() => league.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});