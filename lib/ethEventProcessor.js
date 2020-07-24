require('module-alias/register')
const config = require('config');
const Web3 = require('web3')
var Web3WsProvider = require('web3-providers-ws');
var options = {
    timeout: 30000, // ms
    // Useful if requests result are large
    clientConfig: {
      maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
      maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
    },
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 500,
        onTimeout: true
    }
};
const web3 = new Web3(new Web3WsProvider(config.get('wsUrl'), options))

const { toBN, fromWei } = web3.utils

let token; 
const {
    getToken
} = require('@lib/ethInfra');

const {
    setBalance
  } = require('./pg_client');

const subscribeVaultEventListener = (contract, eventName, cb) => {
    const eventJsonInterface = web3.utils._.find(
        contract._jsonInterface,
        o => o.name === eventName && o.type === 'event',
    )
    web3.eth.subscribe('logs', {
        address: contract.options.address,
        topics: [eventJsonInterface.signature]
    }, async (error, result) => {
        if (error) {
            console.log("Error receiving event: ", error)
            return
        }
        const eventObj = web3.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
        )
            try{
                await cb(eventObj)
            } catch (e){
                console.log("Error running cb: ", e)
            }
    })
}

async function transferListener(event) {
    try{
        let balance;
        if (!toBN(event.to).eq(toBN('0'))){
            balance = await token.methods.balanceOf(event.to).call();
            await setBalance(event.to.toLowerCase(), Math.round(fromWei(balance)))
        }
        if (!toBN(event.from).eq(toBN('0'))){
            balance = await token.methods.balanceOf(event.from).call();
            await setBalance(event.from.toLowerCase(), Math.round(fromWei(balance)))
        }
    } catch (e) {
        console.log(e)
    }
}

(async () => {
    token = await getToken();
    subscribeVaultEventListener(token, 'Transfer', transferListener);
})();