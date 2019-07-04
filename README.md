[![Coverage Status](https://coveralls.io/repos/github/brianbixby/bracket-busters-back-end/badge.svg?branch=master)](https://coveralls.io/github/brianbixby/bracket-busters-back-end?branch=master)

## Project: Bracket Busters (NBA Pick 'em App)

Bracket Busters is an application allows users to compete against their friends by pricking winners for real world NBA basketball games.

You are able to create and manage your own private and public leagues with a real time scoreboard for all participants. Each league has it's own message board  (aka smack talk board) that is private to only league participants.

If it's too late to join a league, but you want to stay up to date on the latest happenings or would just like to communicate with those outside of your league, groups are for you. Each group has its own message board so users can communicate with each other.

## Frontend

Information about the frontend of Bracket Busters can be found here: [Bracket Busters Frontend](https://github.com/brianbixby/bracket-busters-frontend)

## Tech/frameworks/packages

- Node 
- MongoDB
- Travis
- Coveralls
- Heroku
- Github
- NPM/Yarn
- Backend Node packages:
  - Production
    - Bcryptjs
    - Bluebird
    - Cors
    - Coveralls
    - Debug 
    - Del 
    - Dotenv 
    - Express  
    - Http-errors 
    - Jsonwebtoken 
    - Mongoose 
    - Morgan
    - Nyc
  - Development
    - Eslint
    - Faker
    - Jest
    - Superagent 
    
- Frontend Node packages:
  - Autoprefixer          
  - Babel-core         
  - Babel-plugin-transform-class-properties          
  - Babel-plugin-transform-object-rest-spread          
  - Babel-preset-env          
  - Babel-preset-react                        
  - Cors                   
  - Dotenv          
  - Express          
  - Node-sass         
  - NPM          
  - Parcel-bundler
  - Postcss-modules          
  - React                   
  - React-dom          
  - React-redux          
  - React-router          
  - React-router-dom          
  - Redux                          
  - Superagent                  
  - Validator                  
- devDependencies:
  - Babel-jest
  - babel-plugin-static-fs
  - Babel-plugin-stylus-compiler
  - Babel-plugin-transform-async-to-generator
  - Babel-plugin-transform-css-import-to-string
  - Babel-plugin-transform-es2015-modules-amd
  - Babel-plugin-transform-es3-member-expression-literals
  - Babel-plugin-transform-es3-property-literals
  - Babel-plugin-transform-object-assign
  - Babel-plugin-transform-version-inline
  - Babel-preset-es2015
  - Babel-preset-stage-0     
  - Enzyme          
  - Enzyme-adapter-react-16          
  - Eslint                  
  - Jest          
  - Redux-devtools-extension
  - Redux-logger 

## Entity Relationship Diagram

![Demo](./public/img/erd.png)
https://www.lucidchart.com/documents/view/ccfd14a4-7127-4097-8bf9-ca0d567cc323/0


## How to use?
Clone this repo, cd into the root of the project, run `npm i` from your command line to install all of our dependencies. Please make sure that you have mongodb and httpie installed on your machine. You can brew install them both if you do not already have them with `brew install httpie mongodb`. Please refernce the installation instructions for MongoDB `https://docs.mongodb.com/manual/administration/install-community/`, there are typically 1 or 2 quick things you need to do after you Brew install it. 

Run `npm run start` from terminal to start the server. Open a new tab in terminal and run `mongod` to start the Mongo process. Open another terminal tab and run `mongo` to open a Mongo shell (for viewing the contents of your local database). Lastly, open up a final terminal tab; this is where you will be making all of your server requests. Instructions and examples are below.

## Routes

### Auth/User Routes
#### POST: `/api/signup`
Create a new  user with the properties `username`, `email`, `password` and `findHash`, (findHash is automatically created for you).
```
http POST :3000/api/signup username=newusername email=newemail@gmail.com password=newpassword
http POST :3000/api/signup username=<username> email=<email> password=<password>
```
#### GET: `/api/signin`
As an existing user you can login to your profile, which will authenticate you with a json web token and allow you to make requests to our API.
```
http POST :3000/api/signup username=newusername email=newemail@gmail.com password=newpassword
http POST :3000/api/signup username=<username> email=<email> password=<password>
```
Throws an error if any of the requested properties that are not created for you are missing.

The User model will return a json web token if there are no errors, and create a profile model for the newly instantiated user to add more detailed information to.

### Profile Routes
#### GET: `/api/profile/<profile id>`
Retrieve your user profile and update your information for other users to see.

```
http -a newusername:newpassword :3000/api/signin
http -a <username>:<password> :3000/api/signin
```
Throws an error if any of the requested properties that are not created for you are missing.

The User model will return a json web token if there are no errors.
#### PUT: `/api/profile/<profile id>`
This will allow you to make changes to a specific profile.

### Sporting Event Routes
#### POST: `/api/sportingevent`

Add a sporting event with the properties `name`, `desc`, `createdOn`, and `tags`. The property `createdOn` is generated automatically, and the `tags` property is available for any extra information that a user may want to add.

```
http POST :3000/api/sportingevent 'Authorization:Bearer <token>' sportingEventName='<event name>' desc='<description>'
```
After a successful POST, you receive an object of the new sporting event you created, like the example below:
```
{
    "__v": 0, 
    "_id": "5aa9acbe42358a6e7b6a6450", 
    "createdOn": "2018-03-14T23:14:06.602Z", 
    "desc": "some text and stuff", 
    "sportingEventName": "baseball", 
    "tags": []
}
```

#### GET: `/api/sportingevent/<sporting event id>`

```
http GET :3000/api/sportingevent/<sporting event id> 'Authorization:Bearer <token>'
```
### Game Routes
#### GET: `/api/games`
This will allow you to get all games.
```
http :3000/api/games 'Authorization:Bearer <token>'
```

This will return an array of games.
#### GET: `/api/game/<game id>`
This will return a specific game.
```
http :3000/api/game/<game id> 'Authorization: Bearer <token>'
```
You will receive an object for that specific game.
#### PUT: `/api/game/<game id>`
This will allow you to make changes to a specific game.
```
http PUT :3000/api/game/<game id> 'Authorization:Bearer <token>' homeTeam='hometeam' awayTeam='awayteam' dateTime='datetime' weight='weight' homeScore='homescore' awayScore='awayscore' status='status' winner='winner' loser='loser' sportingEventID='sportingeventid' tags='tags'
```

You will receive the updated object of the game you just modified.

### Team Routes
#### POST: `/api/sportingevent/<sporting event id>/team`
You can create a new team with the properties `teamName`, `sportingEventID`, `createdOn` (which can also be automatically generated), `seed`, `wins`, `losses`, `pretournamentRecord`, and `tags`. Values that are required are `teamName` and `sportingEventId`.
```
http POST :3000/api/sportingevent/<sportingeventid>/team 'Authorization:Bearer <token>' teamName='team name'
```
#### GET: `/api/teams`
Use this call to get an array of all team objects.
```
http :3000/api/teams 'Authorization:Bearer <token>'
```
#### GET: `/api/team/<team id>`
Use this call to get a specific team object.
```
http :3000/api/team/<team id> 'Authorization:Bearer <token>'
```
#### PUT: `/api/team/<team id>`
Use this call to make edits to a specific team.
```
http PUT :3000/api/team/<team id> 'Authorization:Bearer <token>' property='property value'
```
You will receive an object of the team you updated.

### Group Routes
#### POST: `/api/group`
You can create a new group (ie. family, friends, work friends), in which to compete with by choosing teams of sporting games. The properties `groupName`, `privacy`, `size`, `motto`, `createdOn`, `image`, `owner`, `password`, `users`, and `tags`. Values that are required are `groupName`, and `privacy`. 

```
http POST :3000/api/group 'Authorization:Bearer <token>' groupName=<groupname> privacy=<privacysetting>
```

This will return an object of your sporting event, like the example below:

```
{ groupName: 'Schuppe - Swaniawski',
      privacy: 'public',
      owner: '5aab94d02bb501e7ffecf3f8',
      users: [ '5aab94d02bb501e7ffecf3f8' ],
      size: 0,
      createdOn: '2018-03-16T09:56:32.625Z',
      tags: [],
      _id: '5aab94d02bb501e7ffecf3fb',
      __v: 0 }
```
#### GET: `/api/groups`
Use this call to get an array of all group objects.
```
http :3000/api/groups/ 'Authorization:Bearer <token>'
```
#### GET: `/api/group/groupId`
Use this call to get a specific group object.
```
http :3000/api/group/<groupId> 'Authorization:Bearer <token>'
```
#### PUT: `/api/group/groupId`
Use this call to make edits to a specific group.
```
http PUT :3000/api/group/<groupId> 'Authorization:Bearer <token>' property=<propertyname>
```
#### PUT: `/api/group/groupId/adduser`
Use this call to make edits adding a group user to a specific group.
```
http PUT :3000/api/group/<groupId>/adduser 'Authorization:Bearer <token>' 
```
#### PUT: `/api/group/groupId/removeuser`
Use this call to make edits to remove a group user from a specific group.
```
http PUT :3000/api/group/<groupId>/removeuser 'Authorization:Bearer <token>'
```
#### DELETE: `/api/group/groupId`
Use this call to delete a specific group.
```
http DELETE :3000/api/group/<groupId> 'Authorization:Bearer <token>'
```

### League Routes
#### POST: `/api/sportingevent/sportingeventId/league`
You can create a new league with properties `leagueName`, `sportingEventID`, `owner`, `scoring`, `poolSize`, `privacy`, `password`, `winner`, `status`, `users`, `createdOn` (which can also be automatically generated), `size`, `paidUsers`, and `tags`. Values that are required are `leagueName`, `sportingEventId`, `owner`, `scoring`, `poolSize`, and `privacy`.
```
http POST :3000/api/sportingevent/sportingeventId/league 'Authorization:Bearer <token>' leagueName=<leaguename> scoring=<scoring> poolSize=<poolSize> privacy=<privacysetting> password=<password> tags=<tags>
```
This will return an object of your sporting event, like the example below:

```
  { leagueName: 'Boyer - Swaniawski',
      scoring: 'some scoring',
      poolSize: 67889,
      privacy: 'public',
      sportingEventID: 5aab98cd95a2ddeb67a18e0d,
      owner: 5aab98cc95a2ddeb67a18e0b }

```
#### GET: `/api/leagues`
Use this call to get an array of all league objects.
```
http :3000/api/leagues 'Authorization:Bearer <token>'
```
#### GET: `/api/league/leagueId`
Use this call to get a specific league object.
```
http :3000/api/leagues/leagueId 'Authorization:Bearer <token>'
```
#### PUT: `/api/league/leagueId`
Use this call to make edits to a specific league.
```
http PUT :3000/api/leagues/leagueId 'Authorization:Bearer <token>' property=<propertyname>
```
#### PUT: `/api/league/leagueId/adduser`
Use this call to make edits adding a league user to a specific league.
```
http PUT :3000/api/leagues/leagueId/adduser 'Authorization:Bearer <token>'
```
#### PUT: `/api/league/:leagueId/removeuser`
Use this call to make edits removing a league user from a specific league.
```
http PUT :3000/api/leagues/leagueId/removeuser 'Authorization:Bearer <token>'
```
#### DELETE: `/api/league/:leagueId`
Use this call to delete a specific group.
```
http DELETE :3000/api/leagues/leagueId/ 'Authorization:Bearer <token>'
```

### User Pick Routes
#### POST: `/api/league/leagueId/userpick`
A user can create their pick with properties `userID` which is automatically filled in with the user who created the pick, `leagueID`, `gameID`, `pick` which is the id of the team, `correct` which is a boolean value, and `gameTime`. All properties are required except `correct` which will be changed at the end of the game.
```
http POST :3000/api/league/<league id>/userpick 'Authorization:Bearer <token>' gameID='gameID' pick='teamID' gameTime='Date'
```
This will return an object of your sporting event, like the example below:

```
userPick:  { userID: 5aab9b85785570ed8c8ad31f,
      leagueID: 5aab9b85785570ed8c8ad322,
      gameID: 5aab9b85785570ed8c8ad326,
      pick: 5aab9b85785570ed8c8ad324,
      gameTime: 2018-03-16T10:25:09.675Z,
      _id: 5aab9b85785570ed8c8ad327,
      __v: 0 }

```
This will return with an object of the created pick.
#### GET: `/api/userpicks`
With this, you will get an array of all user pick objects.
```
http :3000/api/userpicks 'Authorization:Bearer <token>'
```
#### GET: `/api/userpick/<user pick id>`
This will give you a specific user pick object.
```
http :3000/api/userpick/<user pick id> 'Authorization:Bearer <token>'
```
#### PUT: `/api/userpick/<user pick id>`
With this command, you can update a specific user pick.
```
http PUT :3000/api/userpick/<user pick id> 'Authorization:Bearer <token>' property=<updated value>
```
Upon success, you will receive an object containing the user pick object that was modified.

### Score Board Routes
#### GET: `/api/scoreboards`
A users score is updated on the scoreboard according to their picks and the winning teams. Values required are `userID`, and `leagueID`.

This will return an object of your sporting event, like the example below:

```
sboard:  { userID: 5aab9d02440cb9eea20120c5,
      leagueID: 5aab9d02440cb9eea20120c8,
      score: 0,
      _id: 5aab9d02440cb9eea20120c9,
      __v: 0 }

```
#### GET: `/api/scoreboard/scoreBoardId`
Use this call to get a specific scoreBoard object.
```
http :3000//api/scoreboard/:scoreBoardId' 'Authorization:Bearer <token>'
```

### Message Board Routes
#### GET: `/api/messageboards`
A user is able to message other users in their group. Properties used are `leagueID`, `groupID`, `comments`, and `tags`.
```
http :3000//api/messageboard/messageBoardId 'Authorization:Bearer <token>'
```
This will return an object of your sporting event, like the example below:

```
   { leagueID: 5aaba3f0fd43a4f3b802efa3,
      tags: [ 'example tag' ],
      comments: [],
      _id: 5aaba3f0fd43a4f3b802efa4,
      __v: 0 }
```
#### GET: `/api/messageboard/messageBoardId`
Use this call to get a specific messageBoard object.
```
http :3000//api/messageboard/messageBoardId 'Authorization:Bearer <token>'
```

### Comment Routes
#### POST: `/api/messageboard/messageBoardId/comment`
A user is able to comment on messages in the group. The properties used for this are `userID`, `messageBoardID`, `content`, `createdOn` which can also be automatically generated, and `tags`. Required properties are `userID`, `messageBoardID`, and `content`.
```
http POST :3000/api/messageboard/messageBoardId/comment 'Authorization:Bearer <token>'
```
This will return an object of your sporting event, like the example below:
```
 comment:  { userID: 5aab9f3e97974ff026d7aa71,
      messageBoardID: 5aab9f3e97974ff026d7aa76,
      content: 'example content',
      createdOn: 2018-03-16T10:41:02.676Z,
      tags: [],
      _id: 5aab9f3e97974ff026d7aa77,
      __v: 0 }
```
#### GET: `/api/comments`

```
http :3000/api/comments 'Authorization:Bearer <token>'
```
#### GET: `/api/comment/commentId`
Use this call to get a specific comment object.
```
http :3000/api/comment/commentId 'Authorization:Bearer <token>'
```

## Tests

Tests are ran by using the jest testing suite. To run tests, first you must download and copy this repo and run `npm i` in the root directory to install all application dependancies. Run `npm run test` in the root directory of the application in your terminal to check tests.

## Contribute

You can totally contribute to this project if you want. Fork the repo, make some cool changes and then submit a PR.

## Credits

Brian Bixby

## License

MIT. Use it up!

## Deprecated Routes

// fetches aLL LEAGUES
// http GET :3000/api/leagues 'Authorization:Bearer token'
```
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
```

// fetches all groups
// http GET :3000/api/groups 'Authorization:Bearer token'
```
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
```

// fetch all messageBoards
// http GET :3000/api/messageboards 'Authorization:Bearer token'
```
messageBoardRouter.get('/api/messageboards', bearerAuth, (req, res, next) => {
  debug('GET: /api/messageboards');

  MessageBoard.find()
    .then(messageBoards => {
      if(!messageBoards)
        return next(createError(404, 'NOT FOUND ERROR: messageBoards not found'));
      res.json(messageBoards);
    })
    .catch(next);
});
```

// fetch scoreBoard by ID
// http GET :3000/api/scoreboard/:scoreBoardID 'Authorization:Bearer token'
```
scoreBoardRouter.get('/api/scoreboard/:scoreBoardID', bearerAuth, (req, res, next) => {
  debug('GET: /api/scoreboard/:scoreBoardID');

  ScoreBoard.findById(req.params.scoreBoardID)
    .then( scoreBoard => {
      if(!scoreBoard)
        return next(createError(404, 'NOT FOUND ERROR: scoreBoard not found'));
      res.json(scoreBoard);
    })
    .catch(next);
});
```

// fetch a game by ID
// http GET :3000/api/game/:gameID 'Authorization:Bearer token'
```
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
```

// fetch a sporting event by ID
// http GET :3000/api/sportingevent/:sportingEventID 'Authorization:Bearer TOKEN'
```
sportingEventRouter.get('/api/sportingevent/:sportingEventID', bearerAuth, (req, res, next) => {
  debug('GET: /api/sportingEvent/:sportingEventID');

  SportingEvent.findById(req.params.sportingEventID)
    .then( sportingEvent => {
      if(!sportingEvent)
        return next(createError(404, 'NOT FOUND ERROR: sportingEvent not found'));
      res.json(sportingEvent);
    })
    .catch(next);
});
```

// fetch a a team by ID
// http GET :3000/api/team/:teamID 'Authorization:Bearer TOKEN'
```
teamRouter.get('/api/team/:teamID', bearerAuth, (req, res, next) => {
  debug('GET: /api/team/:teamID');

  Team.findById(req.params.teamID)
    .then( team => {
      if(!team)
        return next(createError(404, 'NOT FOUND ERROR: team not found'));
      res.json(team);
    })
    .catch(next);
});
```

// fetch all teams
// http GET :3000/api/team 'Authorization:Bearer TOKEN'
```
teamRouter.get('/api/team', bearerAuth, (req, res, next) => {
  debug('GET: /api/team');

  Team.find()
    .then(teams => {
      if(!teams)
        return next(createError(404, 'NOT FOUND ERROR: teams not found'));
      res.json(teams);
    })
    .catch(next);
});
```

// update a team by ID
// http PUT :3000/api/team/:teamID 'Authorization:Bearer TOKEN' tags='new tag'
```
teamRouter.put('/api/team/:teamID', bearerAuth, json(), (req, res, next) => {
  debug('PUT: /api/team:teamID');

  let teamProperties = req.body.teamName 
  || req.body.sportingEventID 
  || req.body.createdOn 
  || req.body.image
  || req.body.seed 
  || req.body.wins 
  || req.body.losses 
  || req.body.pretournamentRecord
  || req.body.tags;

  if (!teamProperties)
    return next(createError(400, 'BAD REQUEST ERROR: expected a request body'));
    
  Team.findByIdAndUpdate(req.params.teamID, req.body, {new: true, runValidators: true})
    .then( team => res.json(team))
    .catch(next);
});
```

// get a user's profile by profile ID
// http GET :3000/api/profile/:profileID 'Authorization:Bearer TOKEN'
```
profileRouter.get('/api/profile/:profileID', bearerAuth, (req, res, next) => {
  debug('GET: /api/profile/:profileID');

  Profile.findById(req.params.profileID)
    .then(profile => {
      if(!profile)
        return next(createError(404, 'NOT FOUND ERROR: profile not found'));
      // throw createError(401);
      res.json(profile);
    })
    .catch(next);
});
```