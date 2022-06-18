'use strict';

const { Router } = require('express');
const createError = require('http-errors');

const Team = require('../../model/sportingEvent/team.js');
const Game = require('../../model/sportingEvent/game.js');
const ScoreBoard = require('../../model/league/scoreBoard.js');
const UserPick = require('../../model/league/userPick.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const gameRouter = module.exports = Router();

// create a new game
// http POST :3000/api/sportingevent/:sportingeventID/game 'Authorization:Bearer token' homeTeam='id' awayTeam='id' dateTime='2018-05-13 23:37:52-0700'
gameRouter.post('/api/sportingevent/:sportingeventID/game', bearerAuth, (req, res, next) => {
  const { homeTeam, awayTeam, dateTime } = req.body;
  const message = !homeTeam ? 'expected a homeTeam'
    : !awayTeam ? 'expected a awayTeam'
      : !dateTime ? 'expected an dateTime'
        : null;

  if(message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));

  req.body.sportingEventID = req.params.sportingeventID;
  
  new Game(req.body).save()
    .then( game => res.json(game))
    .catch(next);
});

// fetch all games in that game ID's are not in req.body
gameRouter.post('/api/games/:sportingEventID', bearerAuth, (req, res, next) => {
  Game.find( { sportingEventID: req.params.sportingEventID, _id: { $nin: req.body[0] }}).populate({path: 'awayTeam homeTeam', select: 'teamName teamCity image color wins losses starPlayer starPlayerImage'}).sort({ dateTime: 1 })
    .then(games => {
      if(!games)
        return next(createError(404, 'NOT FOUND ERROR: games not found'));
      res.json(games);
    })
    .catch(next);
});

// fetch all games
// http GET :3000/api/games 'Authorization:Bearer token'
gameRouter.get('/api/games', bearerAuth, (req, res, next) => {
  Game.find()
    .then(games => {
      if(!games)
        return next(createError(404, 'NOT FOUND ERROR: games not found'));
      res.json(games);
    })
    .catch(next);
});

// update a game by ID
// http PUT :3000/api/game/gameID 'Authorization:Bearer token' gameID='game._id' winner='team._id' loser='team._id' homeScore=50 awayScore=40 status='played'
gameRouter.put('/api/game/:gameID', bearerAuth, (req, res, next) => {
  let gameProperties = req.body.homeTeam 
  || req.body.awayTeam
  || req.body.dateTime
  || req.body.weight
  || req.body.homeScore 
  || req.body.awayScore 
  || req.body.status
  || req.body.winner 
  || req.body.loser
  || req.body.sportingEventID
  || req.body.tags;

  if (!gameProperties)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body'));

  let game = Game.findByIdAndUpdate(req.params.gameID, req.body, {new: true, runValidators: true})
    .then(updatedGame => game = updatedGame)
    .then(() => {
      return Team.findByIdAndUpdate(game.winner, { $inc: { wins: 1 }})
        .catch(next);
    })
    .then(() => {
      return Team.findByIdAndUpdate(game.loser, { $inc: { losses: 1 }})
        .catch(next);
    })
    .then(() => {
      return UserPick.find({ gameID: req.params.gameID, pick: game.winner }).select('_id userID leagueID')
        .then(userPicks => {
          if(!userPicks)
            return next(createError(404, 'NOT FOUND ERROR: user picks not found'));

          return UserPick.update({ _id: { '$in': userPicks._id } }, { $set: { correct: true }}, {multi: true})
            .then(() => userPicks)
            .catch(next);
        })
        .catch(next);
    })
    .then(userPicks => {
      let userIDs = userPicks.map(userPick => userPick.userID);
      let leagues = userPicks.map(userPick => userPick.leagueID);
      return ScoreBoard.update({ userID: { '$in': userIDs }, leagueID: { '$in': leagues }}, { $inc: { score: 10 }}, {multi: true})
        .catch(next);
    })
    .then(() => res.json(game))
    .catch(next);
});