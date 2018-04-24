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
          profile.groups.push(group._id)
            .then(profile => profile.save())
            .catch(next);
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .then( () => res.json(group))
    .catch(next);
}); 

// add user to private group
groupRouter.post('/api/group/private/adduser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/private/adduser');

  Group.findOneAndUpdate({ groupName: req.body.groupName, password: req.body.password }, { $push: { users: req.user._id }, $inc: { size: 1 }}, { new: true })
    .then( group => {
      Profile.findOneAndUpdate({ userID: req.user._id }, { $push: { groups: req.params.groupId }}, { new: true })
        .then(() => res.json(group))
        .catch(next);
    })
    .catch(next);

  // Group.findOne({ groupName: req.body.groupName, password: req.body.password })
  //   .then( group => {
  //     group.size = group.size + 1;
  //     return group.users.push(req.user._id)
  //       .then(group => group.save())
  //       .catch(next);
  //   })
  //   .then( group => {
  //     Profile.findOne({ userID: req.user._id })
  //       .then( profile => {
  //         profile.groups.push(req.params.groupId).save()
  //           .then(() => res.json(group));
  //       })
  //       .catch( err => Promise.reject(createError(404, err.message)));
  //   })
  //   .catch(next);
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

  Group.findById(req.params.groupID)
    .then( group => {
      group.users.push(req.user._id);
      group.size = group.size + 1;
      return group.save();
    })
    .then( group => {
      Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.push(req.params.groupID);
          profile.save()
            .then(() => res.json(group));
        })
        .catch( err => Promise.reject(createError(404, err.message)));
    })
    .catch(next);
});

// http PUT :3000/api/group/:groupID/removeuser 'Authorization:Bearer token'
groupRouter.put('/api/group/:groupID/removeuser', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/group/:groupID/removeuser');

  Group.findById(req.params.groupID)
    .then( group => {
      group.users.pull(req.user._id);
      group.size = group.size - 1;
      return group.save();
    })
    .then( group => {
      Profile.findOne({ userID: req.user._id })
        .then( profile => {
          profile.groups.pull(req.params.groupID).save()
            .then(() => {
              let returnObj = { groupUsers: group.users, profileGroups: profile.groups };
              res.json(returnObj);
            })
            .catch(next);
        })
        .catch( err => Promise.reject(createError(404, err.message)));
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
      if(group.owner.toString() !== req.user._id.toString())
        return next(createError(403, 'FORBIDDEN ERROR: forbidden access'));

      Group.findByIdAndUpdate(req.params.groupID, req.body, {new: true, runValidators: true})
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

      let profileUpdates = [];
      group.users.forEach(function(groupUser) {
        Profile.findOne({ userID: groupUser })
          .then( profile => profile.groups.pull(req.params.groupID).save())
          .then(profile => profileUpdates.push(profile))
          .catch(next);
      });
      return Promise.all(profileUpdates)
        .then( () => group.remove())
        .catch(next);
    })
    .then(() => res.status(204).send())
    .catch(next);
});