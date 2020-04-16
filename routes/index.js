var express = require('express');
const { setNonce } = require('@lib/redis-client');
const { getVaultData } = require('@lib/ethEvents');
const {
  processSignUpData,
  verifyToken,
  verifySignature
} = require('@lib/auth');

const generateNonce = require('@lib/nonce-generator.js');
var cors = require('cors')

var router = express.Router();


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

router.get('/vault', async function (req, res, next) {
  res.json(getVaultData())
});

router.post('/signup', cors(), async function (req, res, next) {
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
    let url = 'http://localhost:8080/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign
    res.redirect(url)
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;