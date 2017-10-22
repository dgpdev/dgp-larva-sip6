var express = require('express');
var router = express.Router();

// SIP6
const { Environment } = require('storj');

// SIP6
const storj = new Environment({
  bridgeUrl: 'http://localhost:8080',
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
    return res.send({ result: result });
  });
});

router.get('/vault', function(req, res, next) {

  storj.getBuckets(function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
    storj.destroy();
  });

});




module.exports = router;
