'use strict';

const axios = require('axios');
const crypto = require('crypto');
const http = require('http');

const CRYPT_ALG = 'aes-256-ctr';
class Kms {
  constructor (baseUrl) {
    this.request = axios.create({
      baseURL: baseUrl,
      timeout: 1000,
      responseType: 'json',
      httpAgent: new http.Agent({ keepAlive: true }),
    });
  }

  async decrypt (id, data) {
    const result = await this.request.get(`/key/get/${id}`);
    const decipher = crypto.createDecipher(CRYPT_ALG, result.data.ciphertext);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString();

    return JSON.parse(decrypted);
  }
}

module.exports = Kms;