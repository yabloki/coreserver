var express = require('express');
const redisClient = require('../lib/redis-client');
const { processSignUpData } = require('../lib/auth');
const nonce = require('../lib/emoji-generator.js');
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
                      let key =  req.body.address;
                      let value = nonce();
                      await redisClient.setAsync(key, (value));
                      res.json({ nonce: value })
                    }); 

router.post('/signup', cors(), async function(req, res, next) {
                        // if (!verifyToken(req.body.token, req.body.hmac)  || 
                        //     !verifySignature(req.body.signature, req.body.address)) {
                        //       res.send('verification error');
                        //     }
                        try{
                        let {payload, payloadSign} = await processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
                        payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('hex');
                        let url = 'http://localhost:8080/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign
                        res.redirect('http://localhost:8080/api/oauth/sso/callback?payload=' + payload + "&hmac=" + payloadSign)

                      
                      } catch (error) {
                        console.log(error)
                      }
                      }); 

router.get('/signin', function(req, res, next) {
                        if (!verifyToken(req.body.token, req.body.hmac)  || 
                            !verifySignature(req.body.signature, req.body.address)) {
                              res.send('verification error');
                            }
                        paylaod, hmac = processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
                        res.redirect()
                      }); 

module.exports = router;
