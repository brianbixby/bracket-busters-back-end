'use strict';

const createError = require('http-errors');
const debug = require('debug')('bracketbusters:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('basic auth');

  const authHeader = req.headers.authorization;

  if (!authHeader) return next(createError(401, 'authorization header required'));

  const base64str = authHeader.split('Basic ')[1];

  if (!base64str) return next(createError(401, 'username and password required'));

  const [username, password] = Buffer.from(base64str, 'base64').toString().split(':');

  if (!username) return next(createError(401, 'username required'));

  if (!password) return next(createError(401, 'password required'));

  req.auth = {
    username,
    password,
  };

  next();
};