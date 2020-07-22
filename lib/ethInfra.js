const config = require('config');
const Web3 = require('web3')
var Web3WsProvider = require('web3-providers-ws');
const vaultInterface = require('@root/CNTVault.json')
const tokenInterface = require('@root/CNTToken.json')
const vaultDeployedAddress = vaultInterface.networks[config.get('networkId')].address

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
let vault = new web3.eth.Contract(vaultInterface.abi, vaultDeployedAddress)
let token;

async function getVaultData() {
    return {
        abi:vaultInterface.abi,
        address:vaultDeployedAddress,
        rate: await getEthUsdRate()
    }
}

function getVault() {
    return new web3.eth.Contract(vaultInterface.abi, vaultDeployedAddress)
}

async function getToken() {
    if (! token) {
        let tokenDeployedAddress = await vault.methods.token().call()
        token = new web3.eth.Contract(tokenInterface.abi, tokenDeployedAddress)
    }
    return token
}

//TODO FIX STUB
async function getEthUsdRate() {
    return await vault.methods.getRate().call()
}

module.exports = {
    getVaultData,
    getToken,
    getVault,
    getEthUsdRate
}
    