const crypto = require('crypto');
async function processSignUpData(token, hmac, signature, address) {
     const secret = "537d8e3b7cd2361091cfcfc7171967b6db6a955b93c104d097c5ff7366bb178e"
     const bufferedKey = Buffer.from(secret, 'hex');
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
             
    const payloadSign = crypto.createHmac('sha256', bufferedKey)
                                .update(JSON.stringify(payload))
                                .digest('hex');
    return { payload, payloadSign }
}


module.exports = {
    processSignUpData
};