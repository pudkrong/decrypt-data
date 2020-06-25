'use strict';

const pino = require('pino');

const logger = pino({
  level: process.env.ERROR_LEVEL || 'info',
  prettyPrint: true
});

module.exports = logger;