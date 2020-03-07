
async function auth(){
    try{
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            await ethereum.enable();
            signNonce(web3);
        }
        else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
            signNonce(web3);
        }
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    } catch (error) {

    }
}

async function signNonce(w3) {
    let nonce = (await axios.post('/nonce', {
                                            address: web3.eth.coinbase
                                           })).data.nonce
    w3.personal.sign(web3.fromUtf8(nonce), web3.eth.coinbase, verifySignature);
}

async function verifySignature(error, signature) {
    if (error) {
        console.log(error)
        return
    }
    let token  = findGetParameter('token');
    let hmac  = findGetParameter('hmac');
    await axios.post('/signup', {
                                    token,
                                    hmac,
                                    signature,
                                    address: web3.eth.coinbase
                                })
    window.close ()
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}