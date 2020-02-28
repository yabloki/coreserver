var express = require('express');
const { setNonce } = require('../lib/redis-client');
const { processSignUpData, verifyToken, verifySignature } = require('../lib/auth');
const generateNonce = require('../lib/emoji-generator.js');
var cors = require('cors')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
                  res.render('index', { title: 'Express' });
                });


router.get('/auth', function(req, res, next) {
                        res.render('auth');
                    });

router.get('/nonce', async function(req, res, next) {
                      let nonce = generateNonce()
                      await setNonce(req.body.address, nonce)
                      res.json({ nonce })
                    }); 

router.post('/signup', cors(), async function(req, res, next) {
                        if (!verifyToken(req.body.token, req.body.hmac)  || 
                            !verifySignature(req.body.signature, req.body.address)) {
                              res.send('verification error');
                            }
                        try{
                          let {payload, payloadSign} = processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
                          payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('hex');
                          let url = 'http://localhost:8080/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign
                          res.redirect(url)
                        } catch (error) {
                           console.log(error)
                        }
                      }); 

router.get('/signin', function(req, res, next) {
                        if (!verifyToken(req.body.token, req.body.hmac)  || 
                            !verifySignature(req.body.signature, req.body.address)) {
                              res.send('verification error');
                            }
                        payload, hmac = processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
                        res.redirect()
                      }); 

module.exports = router;
