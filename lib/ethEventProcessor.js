require('module-alias/register')
const config = require('config');
const Web3 = require('web3')
const web3 = new Web3(config.get('wsUrl'))
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
        if (!web3.utils.toBN(event.to).eq(web3.utils.toBN('0'))){
            balance = await token.methods.balanceOf(event.to).call();
            await setBalance(event.to.toLowerCase(), Math.round(web3.utils.fromWei(balance)))
        }
        if (!web3.utils.toBN(event.from).eq(web3.utils.toBN('0'))){
            balance = await token.methods.balanceOf(event.to).call();
            await setBalance(event.from.toLowerCase(), Math.round(web3.utils.fromWei(balance)))
        }
    } catch (e) {
        console.log(e)
    }
}

(async () => {
    token = await getToken();
    subscribeVaultEventListener(token, 'Transfer', transferListener);
})();