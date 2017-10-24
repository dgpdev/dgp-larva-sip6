var express = require('express');
var router = express.Router();

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = 'http://alpha.digipulse.io:8080';
var client;
var keypair;

// SIP6
const { Environment } = require('storj');

// SIP6
var storj;


/* GET GENERAL INFO */
router.get('/login/:user/:pass', function(req, res, next) {

  // SIP5 basic login

  var user = {email: req.params.user, password: req.params.pass};

  var client = storjlib.BridgeClient(DIGIPULSE_HUB, {basicAuth: user});
  var keypair = storjlib.KeyPair();

  client.addPublicKey(keypair.getPublicKey(), function(err) {
  if (err) {
    return res.send({ status: 'fail', message: err.message });
  }

  //storeSessionKey(req, keypair.getPrivateKey());
  //res.send({ status: 'success', message: 'Login success', keypair: keypair });
  console.log ('session stored as ' + req.session.keypair);
  });

  // Login to SIP6 after success from SIP5
  // SIP 6 authed and loading vaults
  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: user.email,
   bridgePass: user.password,
   encryptionKey: 'test',
   logLevel: 4
 });

 storj.getBuckets(function(err, result) {
   if (err) {
     return res.send({ error: err.message,  storj: user });
   }
   return res.send({ result: result, storj: storj, keypair: keypair });
   storj.destroy();
 });



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

/* Upload files */
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

router.get('/vault/file/download/:vault/:fileid', function(req, res, next) {

  var bucketId = req.params.vault;
  var fileId = req.params.fileid;
  var downloadFilePath = './test.js';

  storj.resolveFile(bucketId, fileId, downloadFilePath, {
    progressCallback: function(progress, downloadedBytes, totalBytes) {
      console.log('Progress: %d, downloadedBytes: %d, totalBytes: %d',
                  progress, downloadedBytes, totalBytes);
    },
    finishedCallback: function(err) {
      if (err) {
        return console.error(err);
      }
      console.log('File download complete');
      storj.destroy();
    }
  });
});


module.exports = router;

/* Info only, these calls need binding.
 Nan::SetPrototypeMethod(constructor, "getInfo", GetInfo);
 Nan::SetPrototypeMethod(constructor, "getBuckets", GetBuckets);
 Nan::SetPrototypeMethod(constructor, "createBucket", CreateBucket);
 Nan::SetPrototypeMethod(constructor, "deleteBucket", DeleteBucket);
 Nan::SetPrototypeMethod(constructor, "listFiles", ListFiles);
 Nan::SetPrototypeMethod(constructor, "storeFile", StoreFile);
 Nan::SetPrototypeMethod(constructor, "storeFileCancel", StoreFileCancel);
 Nan::SetPrototypeMethod(constructor, "resolveFile", ResolveFile);
 Nan::SetPrototypeMethod(constructor, "resolveFileCancel", ResolveFileCancel);
 Nan::SetPrototypeMethod(constructor, "deleteFile", DeleteFile);
 Nan::SetPrototypeMethod(constructor, "destroy", DestroyEnvironment);
 */
