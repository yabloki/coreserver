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
            return "cryptoAnonymous"
        }
        if (name.rowCount == 1) {
            return name.rows[0].name
        } else {
            console.log ("ERROR: multiple db rows for - ", name.rows[0])
        }
    } catch (e) {
        client = undefined;
    }
// error handling
}

async function setDeposit(address, amount) {
    let client = await getClient();
    client.query(
        'UPDATE public.commenters SET sprtokens = sprtokens + $1::bigint WHERE email = $2;', 
        [amount, address], 
        function(err, result) {
            if (err) {
                console.log(err);
            }
        }
    );
}


module.exports = {
    getNameByAddress,
    setDeposit
  };