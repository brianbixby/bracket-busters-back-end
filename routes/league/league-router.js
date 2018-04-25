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
      return Profile.findOne({ userID: req.user._id })
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( profile => {
          profile.leagues.push(league._id);
          return profile.save();
        });
    })
    .then( () => res.json(league))
    .catch(next);
});

// add user to private league
leagueRouter.post('/api/league/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/league/private/adduser');
  console.log('req.body: ', req.body);

  return League.findOne({ leagueName: req.body.leagueName, password: req.body.password })
    .then( league => {
      league.users.push(req.user._id);
      league.size = league.size + 1;
      return league.save();
    })
    .then( league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id };
      if (!scoreboard.leagueID || !scoreboard.userID ) return next(createError(400, 'expected a request body leagueID and userID'));
      return new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch( err => Promise.reject(createError(404, err.message)));
      // .then( scoreBoard => {
      //   return { scoreBoardLeague: scoreBoard.leagueID, scoreBoardUser: scoreBoard.userID, leagueUsers: league.users };
      // });
    })
    .then( returnObj => {
      return Profile.findOne({ userID: req.user._id })
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( profile => {
          profile.leagues.push(req.params.leagueId);
          profile.save();
          // returnObj.profileLeagues = profile.leagues;
          console.log('returnobj: ', returnObj);
          res.json(returnObj);
          // console.log('myLeague: myLeague');
          // res.json(myLeague);
        });
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

  return League.findById(req.params.leagueID)
    .then( league => {
      league.users.push(req.user._id);
      league.size = league.size + 1;
      return league.save();
    })
    .then( league => {
      let scoreboard = { leagueID: league._id, userID: req.user._id };
      if (!scoreboard.leagueID || !scoreboard.userID ) return next(createError(400, 'expected a request body leagueID and userID'));
      return new ScoreBoard(scoreboard).save()
        .then(() => league)
        .catch( err => Promise.reject(createError(404, err.message)));
      // .then( scoreBoard => {
      //   return { scoreBoardLeague: scoreBoard.leagueID, scoreBoardUser: scoreBoard.userID, leagueUsers: league.users };
      // });
    })
    .then( returnObj => {
      return Profile.findOne({ userID: req.user._id })
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( profile => {
          profile.leagues.push(req.params.leagueID);
          profile.save();
          // returnObj.profileLeagues = profile.leagues;
          res.json(returnObj);
          // console.log('myLeague: myLeague');
          // res.json(myLeague);
        });
    })
    .catch(next);
});

// http PUT :3000/api/league/:leagueID/removeuser 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/league/:leagueID/removeuser');

  return League.findById(req.params.leagueID)
    .then( league => {
      league.users.pull(req.user._id);
      league.size = league.size - 1;
      return league.save();
    })
    .then( league => {
      return ScoreBoard.findOneAndRemove({ userID: req.user._id, leagueID: req.params.leagueID })
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( () => {
          return { scoreBoardResStatus: 204, leagueUsers: league.users };
        });
    })
    .then( returnObj => {
      return UserPick.remove({ userID: req.user._id, leagueID: req.params.leagueID }).exec()
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( () => {
          returnObj.scoreBoardResStatus = 204;
          return returnObj;
        });
    })
    .then( finalReturnObj => {
      return Profile.findOne({ userID: req.user._id })
        .catch( err => Promise.reject(createError(404, err.message)))
        .then( profile => {
          profile.leagues.pull(req.params.leagueID);
          profile.save();
          finalReturnObj.profileLeagues = profile.leagues;
          res.json(finalReturnObj);
        });
    })
    .catch(next);
});

// http PUT :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.put('/api/league/:leagueID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/league/:leagueID');

  if (!req.body) return next(createError(400, 'expected a request body'));
  return League.findById(req.params.leagueID)
    .then( league => {
      if(league.owner.toString() !== req.user._id.toString()) return next(createError(403, 'forbidden access'));
      League.findByIdAndUpdate(req.params.leagueID, req.body, {new: true, runValidators: true})
        .then( league => res.json(league));
    })
    .catch(next);
});

// http DELETE :3000/api/league/:leagueID 'Authorization:Bearer token'
leagueRouter.delete('/api/league/:leagueID', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/league/:leagueID');
  return League.findById(req.params.leagueID)
    .then( league => {
      if(league.owner.toString() !== req.user._id.toString()) return next(createError(403, 'forbidden access'));
      let profileUpdates = [];
      league.users.forEach(function(luser) {
        profileUpdates.push(
          Profile.findOne({ userID: luser })
            .then( user => {
              user.leagues.pull(req.params.leagueID);
              return user.save();
            }));
      });
      return Promise.all(profileUpdates)
        .then( () => league.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});