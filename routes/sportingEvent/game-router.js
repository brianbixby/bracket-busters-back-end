'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:game-router');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const Game = require('../../model/sportingEvent/game.js');
const ScoreBoard = require('../../model/league/scoreBoard.js');
const UserPick = require('../../model/league/userPick.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const gameRouter = module.exports = Router();

// http POST :3000//api/sportingevent/:sportingeventID/game 'Authorization:Bearer token' homeTeam='id' awayTeam='id' dateTime='2018-05-13 23:37:52-0700'
gameRouter.post('/api/sportingevent/:sportingeventID/game', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/sportingevent/:sportingeventID/game');

  const { homeTeam, awayTeam, dateTime } = req.body;
  const message = !homeTeam ? 'expected a homeTeam'
    : !awayTeam ? 'expected a awayTeam'
      : !dateTime ? 'expected an dateTime'
        : null;

  if (message) return next(createError(400, message));

  req.body.sportingEventID = req.params.sportingeventID;
  
  new Game(req.body).save()
    .then( game => res.json(game))
    .catch(next);
});

// all games by sporting event ID
// Game.find( {sportingEventID: req.params.sportingEventID })
gameRouter.post('/api/games/:sportingEventID', bearerAuth, json(), (req, res, next) => {
  debug('POST:/api/games/:sportingEventID');

  Game.find( { _id: { $nin: req.body[0] }}).populate({path: 'awayTeam homeTeam', select: 'teamName wins losses'})
    .then(games => {
      if(!games)
        return next(createError(404, 'NOT FOUND ERROR: games not found'));
      res.json(games);
    })
    .catch(next);
});

// http GET :3000/api/game/:gameID 'Authorization:Bearer token'
gameRouter.get('/api/game/:gameID', bearerAuth, (req, res, next) => {
  debug('GET: /api/game/:gameID');

  Game.findById(req.params.gameID)
    .then( game => {
      if(!game)
        return next(createError(404, 'NOT FOUND ERROR: game not found'));
      res.json(game);
    })
    .catch(next);
});

// http GET :3000/api/games 'Authorization:Bearer token'
gameRouter.get('/api/games', bearerAuth, (req, res, next) => {
  debug('GET: /api/games');

  Game.find()
    .then(games => {
      if(!games)
        return next(createError(404, 'NOT FOUND ERROR: games not found'));
      res.json(games);
    })
    .catch(next);
});


// http PUT :3000/api/game/gameID 'Authorization:Bearer token' gameID='game._id' winner='team._id' loser='team._id' homeScore=50 awayScore=40 status='played'
gameRouter.put('/api/game/:gameID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/game/:gameID');

  if (!req.body) return next(createError(400, 'expected a request body'));
  let game = Game.findByIdAndUpdate(req.params.gameID, req.body, {new: true, runValidators: true})
    .then( updatedGame => {
      if(!req.body.winner) res.json(updatedGame);
      return game = updatedGame;
    })
    .then( () => {
      Team.findById(game.winner)
        .then( team => {
          team.wins = team.wins + 1;
          return team.save();
        })
        .catch(next);
    })
    .then( () => {
      Team.findById(game.loser)
        .then( team => {
          team.losses = team.losses + 1;
          return team.save();
        })
        .catch(next);
    })
    .then ( () => {
      UserPick.find({ gameID: req.params.gameID })
        .then( userPicks => {
          let scoreBoard2Update = [];
          userPicks.forEach(function(userPick) {
            if(userPick.pick.toString() == game.winner.toString()) {
              userPick.correct = true;
              userPick.save();
              scoreBoard2Update.push(
                ScoreBoard.findOne({ userID: userPick.userID, leagueID: userPick.leagueID })
                  .then( newscoreBoard => {
                    newscoreBoard.score += (1 * game.weight);
                    return newscoreBoard.save();
                  }));
            }           
            else { 
              userPick.correct = false;
              return userPick.save();
            }
            return Promise.all(scoreBoard2Update)
              .catch(next);
          });
        });
    })
    .then(() => res.send('success'))
    .catch(next);
});