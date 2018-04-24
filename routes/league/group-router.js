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
    : !privacy ? 'expected a privacy'
      : null;
  
  if (message) return next(createError(400, message));

  req.body.owner = req.user._id;
  req.body.users = req.user._id;
  req.body.ownerName = req.user.username;
 
  let group = new Group(req.body).save()
    .then( myGroup => {
      group = myGroup;
      return new MessageBoard({ groupID: group._id }).save();
    })
    .then( () => {
      return Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.push(group._id);
          return profile.save();
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .then( () => res.json(group))
    .catch(next);
}); 

// http PUT :3000/api/group/:groupId/adduser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupId/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupId/adduser');

  Group.findById(req.params.groupId)
    .then( group => {
      group.users.push(req.user._id);
      group.size = group.size + 1;
      return group.save();
    })
    .then( group => {
      Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.push(req.params.groupId);
          profile.save();
          res.json(group);
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .catch(next);
});

// add user to private group
groupRouter.post('/api/group/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/private/adduser');

  return Group.findOne({ groupName: req.body.groupName, password: req.body.password })
    .then( group => {
      group.users.push(req.user._id);
      group.size = group.size + 1;
      return group.save();
    })
    .then( group => {
      return Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.push(req.params.groupId).save()
            .then(() => res.json(group));
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupId/removeuser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupId/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupId/removeuser');

  Group.findById(req.params.groupId)
    .then( group => {
      group.users.pull(req.user._id);
      group.size = group.size - 1;
      return group.save();
    })
    .then( group => {
      Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.pull(req.params.groupId).save()
            .then(() => {
              let returnObj = { groupUsers: group.users, profileGroups: profile.groups };
              res.json(returnObj);
            });
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupId 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupId', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupId');

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

  if (!groupProperties) return next(createError(400, 'expected a request body'));
  return Group.findById(req.params.groupId)
    .then( group => {
      if(group.owner.toString() !== req.user._id.toString()) return next(createError(403, 'forbidden access'));
      Group.findByIdAndUpdate(req.params.groupId, req.body, {new: true})
        .then( group => res.json(group));
    })
    .catch(next);
});

// http DELETE :3000/api/group/:groupId 'Authorization:Bearer token'
groupRouter.delete('/api/group/:groupId', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/group/:groupId');

  return Group.findById(req.params.groupId)
    .then( group => {
      if(!group) throw createError(401);
      if(group.owner.toString() !== req.user._id.toString()) return next(createError(403, 'forbidden access'));
      let profileUpdates = [];
      group.users.forEach(function(groupUser) {
        profileUpdates.push(
          Profile.findOne({ userID: groupUser })
            .then( user => user.groups.pull(req.params.groupId).save()));
      });
      return Promise.all(profileUpdates)
        .then( () => group.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});

// RETURNS 1 SPECIFIC GROUP
groupRouter.get('/api/group/:groupId', bearerAuth, (req, res, next) => {
  debug('GET: /api/group/:groupId');

  Group.findById(req.params.groupId)
    .then(group => res.json(group))
    .catch(next);
});

// returns all groups
groupRouter.get('/api/groups', bearerAuth, (req, res, next) => {
  debug('GET: /api/groups');

  Group.find()
    .then(groups => res.json(groups))
    .catch(next);
});

groupRouter.get('/api/groupNames/:groupName', function (req, res, next) {
  debug('GET: /api/groupNames/:groupName');

  Group.findOne({ groupName: req.params.groupName })
    .then( group => {
      if(!group) {
        return res.sendStatus(200);
      }
      return res.sendStatus(409);
    })
    .catch(next);
});

// returns all public groups
groupRouter.get('/api/groups/all/public', bearerAuth, json(), (req, res, next) => {
  debug('GET: /api/groups/allpublic');

  Group.find({ privacy: 'public' })
    .then(groups => res.json(groups))
    .catch(next);
});

// returns all groups of logged in user
groupRouter.post('/api/groups/user', bearerAuth, json(), (req, res, next) => {
  debug('POST: /api/groups/user');

  Group.find( { _id: { $in: req.body} } )
    .then(groups => res.json(groups))
    .catch(next);
});