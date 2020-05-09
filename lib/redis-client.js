var constants = require('./constants');
const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient({
  host: constants.REDIS_URL 
});

const getAsync  = promisify(client.get).bind(client);
const setAsync  = promisify(client.set).bind(client);
const keysAsync = promisify(client.keys).bind(client);


//TODO node_redis: Deprecated: The SET command contains a "null" argument.
// coreserver_1  | This is converted to a "null" string now and will return an error from v.3.0 on.
// coreserver_1  | Please handle this in your code to make sure everything works as you intended it to.
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