//custom from _moduleDirectories, see package.json
const GhostAdminAPI = require('@lib/admin-api/index'); 
const config = require('config');

let api = undefined;

async function getApi(){
    if (!api) {
        api = new GhostAdminAPI({
            url: config.get("gaaUrl"),
            version: config.get("gaaVersion"),
            key: config.get("gaaKey")
        });
    }
    return api
}

async function sendGhostInvite(email, eth_address) {
    let api = await getApi();
    try{
        //TODO role is dynamic, need to query to get proper value
        return await api.invites.add({role_id:"5ef0dfd8da66f30001aae372", email, eth_address})
    } catch (e) {
        console.log(e)
        api = undefined;
        throw e
    }
}

async function getPostPrice(postId) {
    let api = await getApi();
    try{
        return (await api.posts.read({id: postId})).comment_price;
    } catch (e) {
        console.log(e)
        api = undefined;
        throw e
    }
}

async function getRootAddress(postId) {
    let api = await getApi();
    try{
        return(await api.posts.read({id: postId})).primary_author.eth_address.toLowerCase();
    } catch (e) {
        console.log(e)
        api = undefined;
        throw e
    }
}

module.exports = {
    sendGhostInvite,
    getPostPrice,
    getRootAddress
};
