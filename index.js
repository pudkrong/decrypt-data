'use strict';

require('dotenv').config();

const logger = require('./lib/logger');
const Db = require('./lib/db');
const Kms = require('./lib/kms');
const _ = require('lodash');

(async () => {
  try {
    const kms = new Kms(process.env.KMS_URI);
    const database = new Db({
      mongoUri: process.env.MONGO_URI
    });

    const db = await database.connect();
    // Using native mongo collection
    const cursor = db.collection('messages')
      .find({ deleted: false }, {
        projection: { _id: 1, _ct: 1, uid: 1, meta: 1, type: 1, tid: 1, gid: 1 },
        limit: 1000
      });

    cursor
      .on('data', async (doc) => {
        try {
          const data = await kms.decrypt(doc._id, doc._ct.buffer);
          const result = _.assign(_.omit(doc, '_ct'), data);

          logger.info(result);
        } catch (error) {
          logger.error('Cannot decrypt message:: %j', error);
        }
      })
      .on('end', async () => {
        await db.close();
      })
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();

