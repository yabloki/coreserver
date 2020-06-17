const crypto = require('crypto');
const config = require('config');
const ethUtil = require('ethereumjs-util');

const {
    getNonce
} = require('./redis-client');

const {
    getNameByAddress
  } = require('./pg_client');

const secret = Buffer.from(config.get('commentoSecret'), 'hex');

async function processSignUpData(token, hmac, signature, address) {
    let name = await getNameByAddress(address);
    const payload = {
        token,
        "email": address,
        "name": name,
    }

    const payloadSign = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    return {
        payload,
        payloadSign
    }
}

function verifyToken(token, hmac) {
    return hmac == crypto.createHmac('sha256', secret)
        .update(Buffer.from(token, "hex"))
        .digest('hex');
}

async function verifySignature(signature, address) {
    const hex = '0x' + unescape(encodeURIComponent(await getNonce(address)))
        .split('').map(function (v) {
            return v.charCodeAt(0).toString(16)
        }).join('')
    const msgBuffer = ethUtil.toBuffer(hex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    return address == ethUtil.bufferToHex(addressBuffer);
}

module.exports = {
    processSignUpData,
    verifyToken,
    verifySignature
};