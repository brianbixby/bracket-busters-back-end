'use strict';

const { Router, json } = require('express');
const debug = require('debug')('bracketbusters:group-router');
const createError = require('http-errors');

const Group = require('../../model/league/group.js');
const Profile = require('../../model/user/profile.js');
const MessageBoard = require('../../model/league/messageBoard.js');
const bearerAuth = require('../../lib/bearer-auth-middleware.js');

const groupRouter = module.exports = Router();

// create a group, it automatically creates a corresponding message baord and updates your profile
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
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }})
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
}); 

// add user to private group, actually put route
// http POST :3000/api/group/private/adduser 'Authorization:Bearer token groupName='groupname' password='password'
groupRouter.post('/api/group/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/private/adduser');

  Group.findOneAndUpdate({ groupName: req.body.groupName, password: req.body.password }, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true })
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }})
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// fetches all groups of logged in user, actually get route
// http GET :3000/api/groups/user 'Authorization:Bearer token'
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

// fetches a single group by ID
// http GET :3000/api/group/:groupID 'Authorization:Bearer token'
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

// fetches all public groups
// http GET :3000/api/groups/all/public 'Authorization:Bearer token'
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

// group name availability check
// http GET :3000/api/groupNames/:groupName
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

// adds a user to a group
// http PUT :3000/api/group/:groupID/adduser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID/adduser');

  Group.findByIdAndUpdate(req.params.groupID, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true })
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: group._id }})
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// removes a user from a group
// http PUT :3000/api/group/:groupID/removeuser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID/removeuser');

  Group.findByIdAndUpdate(req.params.groupID, { $pull: { users: req.user._id }, $inc: { size: -1 }}, { new: true })
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $pull: { groups: group._id }})
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// updates a group's settings
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
   || req.body.ownerName
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

      Group.findByIdAndUpdate(req.params.groupID, req.body, {new: true, runValidators: true})
        .then(group => res.json(group))
        .catch(next);
    })
    .catch(next);
});

// delete a group
// http DELETE :3000/api/group/:groupID 'Authorization:Bearer token'
groupRouter.delete('/api/group/:groupID', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/group/:groupID');

  Group.findById(req.params.groupID)
    .then(group => {
      if(!group)
        return next(createError(404, 'NOT FOUND ERROR: group not found'));

      if(group.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      return Profile.update({ userID: { '$in': group.users }}, { $pull: { groups: req.params.groupID }}, {multi: true})
        // PRE hook in group model to delete the comments and message board first
        .then(() => group.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});  
