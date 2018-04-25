'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:group-router');
const createError = require('http-errors');

const Group = require('../../model/league/group.js');
const Profile = require('../../model/user/profile.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const groupRouter = module.exports = Router();

// http POST :3000/api/group 'Authorization:Bearer token groupName='newgroupasfd' privacy='aewf'
groupRouter.post('/api/group', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/group');

  const { groupName, privacy } = req.body;
  const message = !groupName ? 'expected a groupName'
    : !privacy ? 'expected privacy'
      : null;
  
  if (message)
    return next(createError(400, `BAD REQUEST ERROR: ${message}`));

  req.body.owner = req.user._id;
  req.body.users = req.user._id;
  req.body.ownerName = req.user.username;
 
  let group = new Group(req.body).save()
    .then( myGroup => {
      group = myGroup;
      return new MessageBoard({ groupID: group._id }).save()
        .catch(next);
    })
    .then(() => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }}).save()
        .then( () => res.json(group))
        .catch(next);
    })
    .catch(next);
}); 

// add user to private group
groupRouter.post('/api/group/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/private/adduser');

  Group.findOneAndUpdate({ groupName: req.body.groupName, password: req.body.password }, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true }).save()
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }}).save()
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// returns all groups of logged in user, actually get route
groupRouter.post('/api/groups/user', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/groups/user');

  Group.find( { _id: { $in: req.body} } )
    .then(groups => {
      if(!groups)
        return next(createError(404, 'NOT FOUND ERROR: groups not found'));
      res.json(groups);
    })
    .catch(next);
});

// RETURNS 1 SPECIFIC GROUP
groupRouter.get('/api/group/:groupID', bearerAuth, (req, res, next) => {
  debug('GET: /api/group/:groupID');

  Group.findById(req.params.groupID)
    .then(group => {
      if(!group)
        return next(createError(404, 'NOT FOUND ERROR: group not found'));
      res.json(group);
    })
    .catch(next);
});

// returns all groups
groupRouter.get('/api/groups', bearerAuth, (req, res, next) => {
  debug('GET: /api/groups');

  Group.find()
    .then(groups => {
      if(!groups)
        return next(createError(404, 'NOT FOUND ERROR: groups not found'));
      res.json(groups);
    })
    .catch(next);
});

groupRouter.get('/api/groupNames/:groupName', (req, res, next) => {
  debug('GET: /api/groupNames/:groupName');

  Group.findOne({ groupName: req.params.groupName })
    .then( group => {
      if(!group) 
        return res.sendStatus(200);
      return res.sendStatus(409);
    })
    .catch(next);
});

// returns all public groups
groupRouter.get('/api/groups/all/public', bearerAuth, json(), (req, res, next) => {
  debug('GET: /api/groups/allpublic');

  Group.find({ privacy: 'public' })
    .then(groups => {
      if(!groups)
        return next(createError(404, 'NOT FOUND ERROR: groups not found'));
      res.json(groups);
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupID/adduser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID/adduser');

  Group.findByIdAndUpdate(req.params.groupID, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true }).save()
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }}).save()
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupID/removeuser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID/removeuser');

  Group.findByIdAndUpdate(req.params.groupID, { $pull: { users: req.user._id }, $inc: { size: -1 }}, { new: true }).save()
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $pull: { groups: group._id }}).save()
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupID 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID');

  let groupProperties = req.body.groupName 
   || req.body.privacy 
   || req.body.size 
   || req.body.motto 
   || req.body.createdOn 
   || req.body.image 
   || req.body.owner 
   || req.body.password 
   || req.body.users 
   || req.body.tags;

  if (!groupProperties)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body'));

  Group.findById(req.params.groupID)
    .then( group => {
      if(!group)
        return next(createError(404, 'NOT FOUND ERROR: group not found'));

      if(group.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      Group.findByIdAndUpdate(req.params.groupID, req.body, {new: true, runValidators: true}).save()
        .then( group => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// http DELETE :3000/api/group/:groupID 'Authorization:Bearer token'
groupRouter.delete('/api/group/:groupID', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/group/:groupID');

  Group.findById(req.params.groupID)
    .then( group => {
      if(!group)
        return next(createError(404, 'NOT FOUND ERROR: group not found'));

      if(group.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      return Profile.update({ userID: { '$in': group.users }}, { $pull: { groups: req.params.groupID }}, {multi: true}).save()
        .then(profile => console.log('array of updated ids: ', profile))
        .then( () => group.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});