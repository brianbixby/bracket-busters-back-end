'use strict';

const createError = require('http-errors');
const debug = require('debug')('bracketbusters:basic-auth-middleware');

module.exports = (req, res, next) => {
  debug('basic auth');

  let { authorization } = req.headers;

  if (!authorization)
    return next(createError(401, 'AUTH ERROR: authorization header required'));

  let encoded = authorization.split('Basic ')[1];

  if (!encoded)
    return next(createError(401, 'AUTH ERROR: not basic auth'));

  const [username, password] = Buffer.from(encoded, 'base64').toString().split(':');

  let message = !username ? 'AUTH ERROR: username required'
    : !password ? 'AUTH ERROR: username required'
      : null;

  if (message) 
    return next(createError(401, message));

  req.auth = {
    username,
    password,
  };

  next();
};