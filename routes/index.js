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

/* GET GENERAL INFO */
router.get('/', function(req, res, next) {
  storj.getInfo(function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
  });
});

/* LIST ALL VAULTS */
router.get('/vault', function(req, res, next) {
  storj.getBuckets(function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
    storj.destroy();
  });
});

/* CREATE VAULTS */
router.get('/vault/create/:name', function(req, res, next) {
  var vaultName = req.params.name;

  storj.createBucket(vaultName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
    storj.destroy();
  });
});

/* CREATE VAULTS */
router.get('/vault/file/upload/:vault/:filepath', function(req, res, next) {
  var bucketId = req.params.vault;
  var fileP = req.params.filepath;

  storj.storeFile(bucketId, fileP, {
  filename: "test.js",
  progressCallback: function(progress, uploadedBytes, totalBytes) {
    console.log('Progress: %d, uploadedBytes: %d, totalBytes: %d',
                progress, uploadedBytes, totalBytes);
  },
  finishedCallback: function(err, fileId) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: fileId });
    }
  });
});



module.exports = router;
