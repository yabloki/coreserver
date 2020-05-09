const config = require('config');
const Web3 = require('web3')
const web3 = new Web3(config.get('wsUrl'))
const vaultInterface = require('@root/CNTVault.json')
const tokenInterface = require('@root/CNTToken.json')
const vaultDeployedAddress = vaultInterface.networks[config.get('networkId')].address
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
    