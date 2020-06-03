//custom from _moduleDirectories, see package.json
const GhostAdminAPI = require('@lib/admin-api/index'); 

let api = undefined;

async function getApi(){
    if (!api) {
        api = new GhostAdminAPI({
            //SECRET
            url: 'http://ghost:2368',
            version: "v3",
            key: '5eb8a1a8fa5eab0001ab587b:a8fe1982a196c9c95ea8c296ff10a4cb0b456b864cd8e2d610faccdc0be554c8'
        });
    }
    return api
}

async function sendGhostInvite(email, eth_address) {
    let api = await getApi();
    try{
        //TODO role is dynamic, need to query to get proper value
        return await api.invites.add({role_id:"5e2e5d30ad41460001684268", email, eth_address})
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
        return(await api.posts.read({id: postId})).primary_author.eth_address;
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