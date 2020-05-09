require('module-alias/register')
const config = require('config');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = config.get('passphrase');
const Web3 = require('web3');
let provider = new HDWalletProvider(mnemonic, config.get('httpNetworkUrl'));
const web3 = new Web3(provider);

const { toBN, toWei } = web3.utils

const {
    isntItBeatifulWhenYouSmokeWeedAndWatchSunset,
    everythingHaveToBeBalanced
} = require('@lib/pg_client');

const {
    getVault,
} = require('@lib/ethInfra');

let commentToRow = {};
let commenterToIndex = {}

let indexToAddress = {}
let N = 1;
const { minCashFlow } = require('@lib/minCashFlow.js');

function getGraph (rs) {
    makeD(rs);
    const ancestors = new Array(rs.rows.length);
    const vert = new Array(N);
    vert[0] =  new Array(N);
    for(let i = 0; i < rs.rows.length; i += 1) {
        ancestors[i] = getListOfAncestors(rs.rows[i]);
        let from = commenterToIndex[rs.rows[i].commenterhex]
        if (vert[from] == undefined){
            vert[from] =  new Array(N);
        }
        for(let j = 0; j < ancestors[i].length; j += 1) {
            let to;
            if (ancestors[i][j].commenterhex) {
                to = commenterToIndex[ancestors[i][j].commenterhex]
            } else {
                to = 0;
            }
            if (vert[from][to] == undefined){
                vert[from][to] = calculateAmountsOwned(j, ancestors[i]);
            } else {
                vert[from][to] = vert[from][to].add(calculateAmountsOwned(j, ancestors[i]));
            }
        }
    }
    for(let i = 0; i < N; i += 1) {
        for(let j = 0; j < N; j += 1) {
            if (i == j || vert[i][j] == undefined) {
                vert[i][j] = toBN('0')
            }
        }
    }
    return vert;
}

// TODO fix stubs

function getPostPrice(){
    return toBN(toWei('100'));
}

function getRoot() {
    // return '679f82a17a79f4b6a2fdef5f1115f73793f263d0ad37b368b81c55478431a968';
    // return '483c9300dbb37adb1a10bf80480897f44ada2348ff8b4cb0e669b2943e1b263c';
    return '0x8BaDfac259121b2927B6654FEb08f70512d0fF99';
}

function makeD(rs) {
    commentToRow['root'] = 'root'
    let rootAddress = getRoot(); 
    commenterToIndex[rootAddress] = 0;
    indexToAddress[0] = rootAddress;
    for (let i = 0; i < rs.rows.length; i += 1) {
        if (!commenterToIndex.hasOwnProperty(rs.rows[i].commenterhex)){
            commenterToIndex[rs.rows[i].commenterhex] = N;
            indexToAddress[N] = rs.rows[i].email
            N += 1;
        }
        commentToRow[rs.rows[i].commenthex] = rs.rows[i];
    }
}

function getListOfAncestors(comment){
    let l = [];
    let p = commentToRow[comment.parenthex]
    l.push(p)
    while( p != 'root'){
        p = commentToRow[p.parenthex]
        l.push(p)
    }
    return l;
}

function calculateAmountsOwned(j, ancestors) {
    let price = getPostPrice();
    if (j  == ancestors.length - 1 && j > 0) {
        return price.div(toBN((1 << (j -1)).toString()))  
    }
    return price.div(toBN((1 << j).toString()))  
}

async function rebalanceOnChain(cashFlow){
    const vault= getVault();
    //  ATTENTION -- THIS FUCKER WILL JUST HANG IF WEB3 NOT CONFIGURED PROPERLY,
    //  "These fucking amateurs..." (c) Walter Sobchak
    // TODO filter transfers
    const receipt = await vault.methods.rebalance(cashFlow).send({from: accounts[0]});
    console.log(receipt)
    //TODO what do we do with receipt
}

(async () => {
    try {
       let rs = await isntItBeatifulWhenYouSmokeWeedAndWatchSunset();
       let cashFlow = minCashFlow(getGraph(rs), N);   
       cashFlow.map(el => {
           el[0] = indexToAddress[el[0]]
           el[1] = indexToAddress[el[1]]
           el[2] = web3.utils.toHex(el[2])
       })
       if (cashFlow.length > 0) {
        await rebalanceOnChain(cashFlow);
        await everythingHaveToBeBalanced(rs.rows.map(row => row.commenthex));
       }
    } catch (e) {
        console.log(e)
    } finally {
        console.log('Done')
        provider.engine.stop();
        process.exit(); 
    }
})();