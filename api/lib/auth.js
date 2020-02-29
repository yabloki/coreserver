const crypto = require('crypto');

const ethUtil = require('ethereumjs-util');

const {
    getNonce
} = require('../lib/redis-client');

const secret = Buffer.from("537d8e3b7cd2361091cfcfc7171967b6db6a955b93c104d097c5ff7366bb178e", 'hex');

function processSignUpData(token, hmac, signature, address) {

    // const expectedHash = crypto.createHmac('sha256', secret)
    //                .update('I love cupcakes')
    //                .digest('hex');
    // if (hmac != expectedHash) {
    //     return 'error'
    // }

    const payload = {
        token,
        "email": address + '@eth.eth',
        "name": 'yabloki',
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