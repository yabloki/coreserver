require('module-alias/register')
const config = require('config');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { getPostPrice,
        getRootAddress } = require('@lib/ghostAdminApi');
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

let commentHexToRow = {};
let commentRootToIndex = {};
let commenterHexToIndex = {}
let postIdToPrice = {}
let postIdToAddress = {}
let N = 0;
let addresses = [];

const { minCashFlow } = require('@lib/minCashFlow.js');

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function onlyPaid(value, index, self) { 
    return value.paid === false;
}

async function prepareData(rs) {
    commentHexToRow['root'] = {commenterhex: 'root'}
    let uniquePosts = rs.rows.filter( onlyPaid ).map(e => e.postid).filter( onlyUnique );
    for(i = 0; i < uniquePosts.length; i += 1) {
        postIdToPrice[uniquePosts[i]] = toBN(toWei(await getPostPrice(uniquePosts[i])));
        let r = await getRootAddress(uniquePosts[i]);
        postIdToAddress[uniquePosts[i]] = r;
        addresses.push(r);
    }
    addresses.push(...rs.rows.map(e => e.email))
    addresses = addresses.filter( onlyUnique );

    for (let i = 0; i < rs.rows.length; i += 1) {
        //this don't have to be quadratic,  may use addressToIndex
        for (let j = 0; j < addresses.length; j += 1) {
            if (rs.rows[i].email == addresses[j]) {
                commenterHexToIndex[rs.rows[i].commenterhex] = j;
            }
            if (postIdToAddress[rs.rows[i].postid] == addresses[j]){
                commentRootToIndex[rs.rows[i].commenthex] = j;
            }
        }
        commentHexToRow[rs.rows[i].commenthex] = rs.rows[i];
    }
    N = addresses.length
}

function getGraph (rs) {
    const ancestors = new Array(N);
    const vert = new Array(N);
    vert[0] =  new Array(N);
    for(let i = 0; i < rs.rows.length; i += 1) {
        if (!rs.rows[i].paid) {
            ancestors[i] = getListOfAncestors(rs.rows[i]);
            let from = commenterHexToIndex[rs.rows[i].commenterhex]
            if (vert[from] == undefined){
                vert[from] =  new Array(N);
            }
            for(let j = 0; j < ancestors[i].length; j += 1) {
                let = ancestors[i][j]
                let to;
                if (rs.rows[i].parenthex == 'root'){
                    to = commentRootToIndex[rs.rows[i].commenthex]
                } else {
                    to = commenterHexToIndex[commentHexToRow[rs.rows[i].parenthex].commenterhex]
                }
                if (vert[from][to] == undefined){
                    vert[from][to] = calculateAmountsOwned(i, j, rs, ancestors[i]);
                } else {
                    vert[from][to] = vert[from][to].add(calculateAmountsOwned(i, j, rs, ancestors[i]));
                }
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

function getListOfAncestors(comment){
    let l = [];
    let next;
    next = commentHexToRow[comment.parenthex];
    l.push(commenterHexToIndex[next.commenterhex])
    while(next.commenterhex !='root'){
        next = commentHexToRow[next.parenthex]
        l.push(commenterHexToIndex[next.commenterhex])
    }
    return l;
}

function calculateAmountsOwned(i, j, rs, ancestors) {
    let price = postIdToPrice[rs.rows[i].postid];
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
    let accounts = await web3.eth.getAccounts() 
    const receipt = await vault.methods.rebalance(cashFlow).send({from: accounts[0]});
    console.log(receipt)
    //TODO what do we do with receipt
}

(async () => {
    try {
       let rs = await isntItBeatifulWhenYouSmokeWeedAndWatchSunset();
       if (rs.rows.length){
         await prepareData(rs)
         let cashFlow = minCashFlow(getGraph(rs), N);   
         cashFlow.map(el => {
             el[0] = addresses[el[0]]
             el[1] = addresses[el[1]]
             el[2] = web3.utils.toHex(el[2])
         })
         if (cashFlow.length > 0) {
             await rebalanceOnChain(cashFlow);
             await everythingHaveToBeBalanced(rs.rows.map(row => row.commenthex));
         }
       }
    } catch (e) {
        console.log(e)
    } finally {
        console.log('Done')
        provider.engine.stop();
        process.exit(); 
    }
})();