var express = require('express');
var auth = require('./auth')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/auth', auth);

router.get('/auth2', function(req, res, next) {
  res.redirect('localhost:8080/api/oauth/sso/callback?payload=PAYLOAD&hmac=HMAC');
});

module.exports = router;
