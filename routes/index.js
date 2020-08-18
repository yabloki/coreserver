var express = require('express');
const { setNonce } = require('@lib/redis-client');
const { getVaultData } = require('@lib/ethInfra');
const { sendGhostInvite,
        getPostPrice,
        getRootAddress } = require('@lib/ghostAdminApi');

const {
  processSignUpData,
  verifyToken,
  verifySignature
} = require('@lib/auth');

const generateNonce = require('@lib/nonce-generator.js');

var router = express.Router();


router.get('/health', function (req, res, next) {
  res.send('OK!!');
});

router.get('/auth', function (req, res, next) {
  res.render('auth');
});

router.post('/nonce', async function (req, res, next) {
  let nonce = generateNonce()
  await setNonce(req.body.address, nonce)
  res.json({
    nonce
  })
});

router.post('/invite', async function (req, res, next) {
  try {
    let success = await sendGhostInvite(req.body.email, req.body.eth);
    res.json({
      success
    })
  } catch (e) {
    res.status(500).json({
      error:e.context
    })
  }
});


router.get('/authoraddress', async function (req, res, next) {
  try {
    let adress = await getRootAddress(req.body.postId);
    res.json({
      adress
    })
  } catch (e) {
    res.status(500).json({
      error:e.context
    })
  }
});

router.post('/post', async function (req, res, next) {
  let price = await getPostPrice(req.body.postId);
  let data  = await getVaultData();
  data.price = price
  res.json(data)
});

router.post('/signup', async function (req, res, next) {
  if (!verifyToken(req.body.token, req.body.hmac) ||
      !await verifySignature(req.body.signature, req.body.address)) {
        res.send('verification error');
        console.log("SIGNUP verification error")
        return;
  }
  try {
    let {
      payload,
      payloadSign
    } = await processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
    payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('hex');
    let url = 'https://commento.2cents.media/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign
    res.redirect(url)
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;