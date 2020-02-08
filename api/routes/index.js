var express = require('express');
const redisClient = require('../lib/redis-client');
const nonce = require('../lib/emoji-generator.js');
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

router.get('/signup', function(req, res, next) {
                        // if (!verifyToken(req.body.token, req.body.hmac)  || 
                        //     !verifySignature(req.body.signature, req.body.address)) {
                        //       res.send('verification error');
                        //     }
                        paylaod, hmac = processSignUpData(req.body.token, req.body.hmac, req.body.signature, req.body.address)
                        res.redirect()
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
