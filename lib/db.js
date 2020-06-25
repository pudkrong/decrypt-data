'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const logger = require('./logger');

class Db {
  constructor (config) {
    this.config = config;

    this.db = null;
  }

  async connect () {
    logger.info('Mongo is connecting...');
    return new Promise((resolve, reject) => {
      mongoose.connect(this.config.mongoUri, _.assign({
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: 3,
        keepAlive: true,
      }, _.omit(this.config, 'mongoUri')));

      this.db = mongoose.connection;
      this.db
        .on('connected', () => {
          logger.info('Mongo is connected');
          return resolve(mongoose.connection);
        })
        .on('error', (error) => {
          logger.error('Mongo connection error:: %j', error);
          return reject(error);
        })
        .on('close', () => {
          logger.info('Mongo connection is closed');
        })
        .on('reconnectFailed', () => {
          logger.error('Mongo retry too many times');
          process.exit('1');
        });
    });
  }
}

module.exports = Db;