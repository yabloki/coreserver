var express = require('express');
const {
  setNonce
} = require('../lib/redis-client');
const {
  processSignUpData,
  verifyToken,
  verifySignature
} = require('../lib/auth');

const generateNonce = require('../lib/nonce-generator.js');
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

router.post('/signup', cors(), async function (req, res, next) {
  if (!verifyToken(req.body.token, req.body.hmac) ||
      !await verifySignature(req.body.signature, req.body.address)) {
        res.send('verification error');
        return;
  }
  try {
    let {
      payload,
      payloadSign
    } = processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
    payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('hex');
    let url = 'http://localhost:8080/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign
    res.redirect(url)
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;