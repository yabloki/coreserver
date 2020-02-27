const crypto = require('crypto');
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
                "name":  'yabloki',
              }
             
    const payloadSign = crypto.createHmac('sha256', secret)
                                .update(JSON.stringify(payload))
                                .digest('hex');
    return { payload, payloadSign }
}

function verifyToken(token, hmac){
    return hmac == crypto.createHmac('sha256', secret)
                                .update(Buffer.from(token,"hex"))
                                .digest('hex');
}

async function verifySignature(signature, address){
    let nonce = await getNonce(address);
    return signature == crypto.createHmac('sha256', secret)
                            .update(Buffer.from(nonce,"hex"))
                            .digest('hex');
}

module.exports = {
    processSignUpData,
    verifyToken,
    verifySignature
};