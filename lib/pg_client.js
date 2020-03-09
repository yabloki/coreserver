const { Client } = require('pg')
let client = undefined;

async function getClient(){
    if (!client || client._connected == false) {
        client = new Client({
            host: 'db',
            database: 'commento'
          })
        await client.connect()
    }
    return client
}



async function getNameByAddress(address) {
    let client = await getClient();
    try {
        let name = await client.query('SELECT name FROM commenters WHERE email = $1', [address]);
        if (name.rowCount == 0) {
            return "AuthorizedAnonymous"
        }
        if (name.rowCount == 1) {
            return name.rows[0].name
        }
    } catch (e) {
        client = undefined;
    }
// error handling
}

module.exports = {
    getNameByAddress
  };