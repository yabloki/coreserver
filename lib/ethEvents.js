const config = require('config');
const Web3 = require('web3')
const web3 = new Web3(config.get('wsUrl'))
const tokenInterface = require('@root/SPRVault.json')
const deployedAddress = tokenInterface.networks[config.get('networkId')].address
let vault = new web3.eth.Contract(tokenInterface.abi, deployedAddress)
const {
    setDeposit
  } = require('./pg_client');

function subscribeVaultEventListener(eventName, cb) {
    const eventJsonInterface = web3.utils._.find(
        vault._jsonInterface,
        o => o.name === eventName && o.type === 'event',
    )
    web3.eth.subscribe('logs', {
        address: vault.options.address,
        topics: [eventJsonInterface.signature]
    }, async (error, result) => {
        if (!error) {
        const eventObj = web3.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
        )
            try{
                await cb(eventObj)
            } catch (e){
                console.log("Error: ", e)
            }
        } else {
            console.log("Error: ", error)
        }
    })
}

async function depositListener(event) {
    await setDeposit(event.depositor.toLowerCase(), Math.round(web3.utils.fromWei(event.sparrows)))
}

function initVaultEventsListener() {
    subscribeVaultEventListener('Deposit', depositListener);
}

function getVaultData() {
    return {
        abi:tokenInterface.abi,
        address:deployedAddress,
        rate: getEthUsdRate()
    }
}

function getEthUsdRate() {
    return "131"
}

module.exports = {
    initVaultEventsListener,
    getVaultData
}
    