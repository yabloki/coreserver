var constants = require('./constants');
const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient({
  host: constants.REDIS_URL 
});

const getAsync  = promisify(client.get).bind(client);
const setAsync  = promisify(client.set).bind(client);
const keysAsync = promisify(client.keys).bind(client);

async function setNonce(address, nonce){
  await setAsync(address, nonce);
}

async function getNonce(address) {
  return await getAsync(address);
}
module.exports = {
  setNonce,
  getNonce
};