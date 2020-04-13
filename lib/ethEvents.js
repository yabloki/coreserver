const config = require('config');
const Web3 = require('web3')
const web3 = new Web3(config.get('wsUrl'))
const tokenInterface = require('@root/SPRVault.json')
const deployedAddress = tokenInterface.networks[config.get('networkId')].address
let vault = new web3.eth.Contract(tokenInterface.abi, deployedAddress)


function subscribeVaultEventListener(eventName, cb) {
    const eventJsonInterface = web3.utils._.find(
        vault._jsonInterface,
        o => o.name === eventName && o.type === 'event',
    )
    web3.eth.subscribe('logs', {
        address: vault.options.address,
        topics: [eventJsonInterface.signature]
    }, (error, result) => {
        if (!error) {
        const eventObj = web3.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
        )
        cb(eventObj)
        } else {
            console.log("Error: ", error)
        }
    })
}

function depositListener(event) {
    console.log(event)
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
    