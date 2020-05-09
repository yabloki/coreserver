const Web3 = require('web3')
const web3 = new Web3()
const { toBN } = web3.utils

let result = [];

function getMin(arr, N) {
    var minInd;
    minInd = 0;
    for (var i = 1; i < N; i += 1) {
        if (arr[i].lt(arr[minInd])) {
            minInd = i;
        }
    }
    return minInd;
}

function getMax(arr, N) {
    var maxInd;
    maxInd = 0;
    for (var i = 1; i < N; i += 1) {
        if (arr[i].gt(arr[maxInd])) {
            maxInd = i;
        }
    }
    return maxInd;
}

function minOf2(x, y) {
    return ((x.lt(y)) ? x : y);
}

function minCashFlowRec(amount, N) {
    var min, mxCredit, mxDebit;
    mxCredit = getMax(amount, N);
    mxDebit = getMin(amount, N);
    if (((amount[mxCredit].eq(toBN('0'))) && (amount[mxDebit].eq(toBN('0'))))) {
        return toBN('0');
    }
    min = minOf2((amount[mxDebit].neg()), amount[mxCredit]);
    amount[mxCredit] = amount[mxCredit].sub(min);
    amount[mxDebit] = amount[mxDebit].add(min);
    result.push([mxDebit,mxCredit,min])
    minCashFlowRec(amount, N);
}

function minCashFlow(graph, N) {
    var amount;
    amount = Array.apply(null, Array(N)).map(() => toBN('0'))
    for (let i = 0; i < N; i += 1) {
        for (let j = 0; j < N; j += 1) {
            amount[i] = amount[i].add((graph[j][i].sub(graph[i][j])));
        }
    }
    minCashFlowRec(amount, N);
    return result;
}

module.exports = {
    minCashFlow
}

