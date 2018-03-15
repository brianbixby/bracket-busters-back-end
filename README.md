# Code Fellows: Code 401d22: Full-Stack JavaScript

## Project 1: Asset Management

I added additional functionality to my 2 resource API, I have incorporated Amazon S3 so users can upload images to Amazon S3 and my database savesa  URL pointing to the site.

## Tech/frameworks/packages

- node 
- MongoDB
- npm
- node packages
  - Production
    - bcrypt
    - bluebird
    - body-parser
    - cors
    - debug
    - dotenv
    - eslint
    - express
    - http-errors
    - jsonwebtoken
    - mongoose
    - morgan
  - Dev
    - jest
    - superagent

## Entity Relationship Diagram

![Demo](./public/img/erd.png)
https://www.lucidchart.com/documents/view/ccfd14a4-7127-4097-8bf9-ca0d567cc323/0
MONGODB_URI='mongodb://heroku_5s3dhwdr:vm0d8l4q47rb9psbn1o247o2in@ds263138.mlab.com:63138/heroku_5s3dhwdr'

## Models

user model (
  _id <type>,
  username <type>,
  email <type>,
  password <type>,
  findHash <type>
);

sportingEvent model (
  _id <type>,
  sportingEventName <type>,
  desc <type>,
  createdOn <type>,
  tags <type>
);

game model (
  _id <type>,
  homeTeam <type>,
  awayTeam <type>,
  weight <type>,
  winner <type>,
  homeScore <type>,
  awayScore <type>,
  date <type>,
  status <type>,
  tags <type>
);

team model (
  _id <type>,
  teamName <type>,
  sportingEventID <type>,
  createdOn <type>,
  seed <type>,
  record <type>,
  pretournamentRecord <type>,
  tags <type>
);

league model (
  _id <type>,
  leagueName <type>,
  sportingEventID <type>,
  owner <type>,
  scoring <type>,
  poolSize <type>,
  privacy <type>,
  password <type>,
  winner <type>,
  status <type>,
  users <type>,
  createdOn <type>,
  size <type>,
  paidUsers <type>,
  tags <type>
);

scoreboard model (
  _id <type>,
  userID <type>,
  leagueID <type>,
  score <type>
);

group model (
  _id <type>,
  groupName <type>,
  privacy <type>,
  size <type>,
  motto <type>,
  createdOn <type>,
  image <type>,
  owner <type>,
  password <type>,
  users <type>,
  tags <type>
);

profile model (
  _id <type>,
  image <type>,
  country <type>,
  state <type>,
  birthDate <type>,
  accountBalance <type>,
  status <type>,
  createdOn <type>,
  lastLogin <type>,
  leagues <type>,
  groups <type>,
  userID <type>,
  tags <type>
);

comment model (
  _id <type>,
  userID <type>,
  content <type>,
  createdOn <type>,
  messageBoardID <type>,
  tags <type>
);

messageBoard model (
  _id <type>,
  leagueID <type>,
  groupID <type>,
  tags <type>
);

userPick model (
  _id <type>,
  userID <type>,
  leagueID <type>,
  gameID <type>,
  pick <type>
);


## How to use?
Clone this repo, cd into `lab-brian`, run `npm install`, brew install httpie and mongodb if you do not already have them `brew install httpie mongodb`. Please refernce the installation instructions for MongoDB `https://docs.mongodb.com/manual/administration/install-community/`, there is typically 1 or 2 quick things you need to do after you Brew install it. 

Run `npm run start` from terminal to start the server. Open a new tab in terminal and run `mongod` to start the Mongo process. Open another terminal tab and run `mongo` to open a Mongo shell. Lastly, open up a final terminal tab; this is where you will be making all of your server requests, instructions and examples are below.

Make POST/GET/DELETE/PUT requests to the server and your local MongoDB.

## Routes

#### `POST /api/signup && /api/list`

Create a new  user with the properties `username`, `email`, `password` and `findHash` which is created for you. Or create a new list with the properties `name`, `desc`, and `created` along with `userID` which are created for you.

```
http POST :3000/api/signup username=briguy999 email=brianbixby0@gmail.com password=password1

http POST :3000/api/list name='my cool list' desc='this list is so cool'
```

Throws an error if any of the requested properties that are not created for you are missing.

The User model will return a json web token and the list model will return a new list if there are no errors.

#### `GET /api/signin && /api/list/<list id>  && /api/lists`

Retrieve the json web token for a created user, or retrieve a single list or all lists for an authenticated user.

```
http -a <username>:<password> :3000/api/signin
http -a <username>:<password> :3000/api/list/<list id>
http -a <username>:<password> :3000/api/lists
```

Throws an error if the route can't be found, the list id is invalid or the use is not authenticated.

#### `DELETE /api/list/<list id>`

Deletes a specific list as requested by the <list id>.

```
http -a <username>:<password> DELETE :3000/api/list/<list id>
```

If successful, a 204 status is returned.

Throws an error if the request parameter (id) is missing or the user is not authenticated.


#### `PUT /api/list/<list id>`

Updates a Jlist with the properties `name`, `desc`, `created` and `userID` from your MongoDB as requested by the <list id>.

```
http -a <username>:<password> PUT :3000/api/list/<list id> name='new list name'
```

If successful, the list is returned with a 200 status.

If a request is made with a list id that is not found, a 404 status is returned.

If a request is made with no list id a 400 status is returned.

If a request is made with out an authenticated user a 401 status is returned.


## Routes

#### `Auth route to signup a user and signin /api/signup /api/signin`

Create a new  user with the properties `username`, `email`, `password` and `findHash` (findHash is automatically created for you).


http POST :3000/api/signup username=newusername email=newemail@gmail.com password=newpassword
http POST :3000/api/signup username=<username> email=<email> password=<password>

As an existing user you can login to your profile, which will authenticate you with a json web token and allow you to make requests to our API.

http -a newusername:newpassword :3000/api/signin
http -a <username>:<password> :3000/api/signin

### `Group Routes`
### POST: `/api/group
Create a new group with the required properties `groupname`, and `privacy`.  `size`, `createdon` and `owner` are created for you.  Optional fields are `motto`, `password`. `tags` are for any extra information you want to add.
```
http POST :3000/api/group 'Authorization:Bearer <token>' groupname=<group name> privacy='<privacy status>' motto='<custom motto>'
```
After a successful POST you recieve an object of the new group you created, like the example below:
```


Update 

### 'POST /api

## Tests

run `npm run tests` to check tests.

#### POST

1. The User model should create and return s json web token and a 200 status code if there is no error.
2. The List model should create and return a new list.
3. Both should respond with a 400 status code if there is no request body.
4. The List model should respond with a 401 status code if there is no json web token provided.

#### GET

1. The User model should return a user's json web token and a 200 status code if there is no error.
2. The list model should return a user's list and a 200 status code if there is no error.
3. The List model should respond with a 401 status code if there is no json web token provided
4. should respond with a 404 status code if a request is made with an id that is not found.
5. The List model should respond with a 200 status code and all lists if there is no parameter (id).

#### DELETE

1. The List model should return a 204 status code if there are no errors.
2. The List model should respond with a 400 status code if there is no parameter (id).
3. The List model should respond with a 404 status code if a request is made with an id that is not found.
4. The List model should respond with a 401 status code if there is no json web token provided.

#### PUT

1. The List model should update and return the updated list along with a 200 status code if there are no errors.
2. The List model should respond with a 400 status code if there is an invalid request body.
3. The List model should respond with a 404 status code if a request is made with an id that is not found.
4. The List model should respond with a 401 status code if there is no json web token provided.

## Contribute

You can totally contribute to this project if you want. Fork the repo, make some cool changes and then submit a PR.

## Credits

Initial codebase created by Code Fellows.

## License

MIT. Use it up!