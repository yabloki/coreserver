const { Client } = require('pg')
const config = require('config');
let client = undefined;

async function getClient(){
    if (!client || client._connected == false) {
        client = new Client({
            host:     config.get('pgHost'),
            user:     config.get('pgUser'),
            password: config.get('pgPassword'),
            database: config.get('pgDatabase')
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
        console.log(e)
        client = undefined;
    }
// error handling
}

async function setBalance(address, amount) {
    let client = await getClient();
    client.query(
        'UPDATE public.commenters SET cnttokens = $1::bigint WHERE email = $2;', 
        [amount, address], 
        function(err, result) {
            if (err) {
                console.log(err);
            }
        }
    );
}

async function everythingHaveToBeBalanced(comments) {
    let client = await getClient();
    let x = await client.query(
        'UPDATE public.comments SET paid = true WHERE commenthex in (' + '\'' + comments.join('\',\'') + '\'' + ');', 
    );
    console.log(x)
}

async function isntItBeatifulWhenYouSmokeWeedAndWatchSunset() {
    let client = await getClient();
    return await client.query(`WITH RECURSIVE commentsToRebalance AS (
        SELECT
            commenthex,
            parenthex,
            c.commenterHex,
            paid,
            path,
            postid,
			cmtrs.email
        FROM
            comments c
			INNER JOIN commenters  cmtrs ON cmtrs.commenterHex = c.commenterHex
        WHERE
            paid = false
        UNION
            SELECT
                c.commenthex,
                c.parenthex,
                c.commenterHex,
                c.paid,
                c.path,
                c.postid,
				cmtrs.email
            FROM
                comments c
			INNER JOIN commenters  cmtrs ON cmtrs.commenterHex = c.commenterHex
            INNER JOIN commentsToRebalance  ctr ON ctr.parenthex = c.commenthex
    ) SELECT
        *
    FROM
        commentsToRebalance;`);
}


module.exports = {
    getNameByAddress,
    setBalance,
    isntItBeatifulWhenYouSmokeWeedAndWatchSunset,
    everythingHaveToBeBalanced
  };