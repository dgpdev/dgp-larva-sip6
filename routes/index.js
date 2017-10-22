var express = require('express');
var router = express.Router();

// SIP6
const { Environment } = require('storj');

// SIP6
const storj = new Environment({
  bridgeUrl: 'https://alpha.digipulse.io:8080',
  bridgeUser: 'steve@digipulse.io',
  bridgePass: 'test',
  encryptionKey: 'test',
  logLevel: 4
});

/* GET home page. */
router.get('/', function(req, res, next) {
  storj.getInfo(function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info:', result);

    storj.getBuckets(function(err, result) {
      if (err) {
        return console.error(err);
      }
      console.log('buckets:', result);
      storj.destroy();
    });
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
