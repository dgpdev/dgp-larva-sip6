/* DIGIPULSE ALPHA SIP5 + SIP6 IMPLENTATION
* This code combines SIP5 + SIP6 and will be known as SIP7
*
* DO NOT FORGET TO SET A NEW SESSION_KEY BEFORE LIVE STAGE !!!
* Code by Steve Walschot
*/

var express = require('express');
var router = express.Router();

var crypto = require('crypto');

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = 'http://alpha.digipulse.io:8080';
var client;
var keypair;

// SIP6
const { Environment } = require('storj');
var storj;

// SESSION data
var SESSION_KEY = 'x6mJac43QZY93bCGu69XX9h8hFB2T5Z2pdpafrc52Gu7CfnQHPYE5KCY5acD4YB46SfCJSQK8699M8NtBbaFeCMp2gPMK2pWSUEZwxuTqYMwV34XE8fv9ar3tuBfz3QRr7vqAM8c6Fb72EheKR4UW5U79WMJ7d7RFjzFt9CcHkVnTZmBdJT7sEaexbMfqmzNcEvaxa9WBrZBBjn8UNe8Sd9sckEpccKjE4rZsUJSBnDnTnB8U5UquXMs7X7KkSbM'


function storeSessionKey(req, key, user) {
    req.session.authed = true;
    req.session.keypair = key;
    req.session.email = user.email;
    req.session.password = encrypt(SESSION_KEY, user.password);
}

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

var auth = function(req, res, next) {
    if (req.session && req.session.authed)
        return next();
    else
        console.log('Session NOT found');
        //return res.send({ status: 'fail', message: 'not logged in to DigiPulse network' });
        res.render('users', { title: 'Testament dashboard' });
};

/* LOGOUT */
router.get('/logout',   function(req, res, next) {
  req.session.destroy(function(err) {
    return res.send({ status: 'success' });
  });
});


router.post('/login', function(req, res, next) {

  /* This is the only stage where the password is needed in plaintext.
  *  Once sent to the sessios, it get's encrypted by the SESSION_KEY.
  */

  // SIP5 basic login
  var user = {email: req.body.user, password: req.body.pass};
  var client = storjlib.BridgeClient(DIGIPULSE_HUB, {basicAuth: user});
  var keypair = storjlib.KeyPair();

  client.addPublicKey(keypair.getPublicKey(), function(err) {
    if (err) {
      return res.send({ status: 'fail', message: err.message });
    }
    storeSessionKey(req, keypair.getPrivateKey(), user);

    // Login to SIP6 after success from SIP5
    // SIP 6 authed and loading vaults
    storj = new Environment({
     bridgeUrl: DIGIPULSE_HUB,
     bridgeUser: req.session.email,
     bridgePass: decrypt(SESSION_KEY, req.session.password),
     encryptionKey: 'test',
     logLevel: 4
   });

   storj.getBuckets(function(err, result) {
     if (err) {
       return res.send({ error: err.message});
     }
     return res.send({ status: 'success', result: result });
     //storj.destroy();
   });
  });
});

/* GET GENERAL INFO */
router.get('/', auth, function(req, res, next) {
  res.render('drives', { title: 'Inheritance API' });

  /*storj.getInfo(function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
  });
  */
});

/* LIST ALL VAULTS */
router.get('/vault', auth, function(req, res, next) {

  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: req.session.email,
   bridgePass: decrypt(SESSION_KEY, req.session.password),
   encryptionKey: 'test',
   logLevel: 4
 });

  storj.getBuckets(function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ status: 'success', result: result });
    //storj.destroy();
  });
});

/* CREATE VAULTS */
router.get('/vault/create/:name', auth, function(req, res, next) {
  var vaultName = req.params.name;

  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: req.session.email,
   bridgePass: decrypt(SESSION_KEY, req.session.password),
   encryptionKey: 'test',
   logLevel: 4
 });

  storj.createBucket(vaultName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
    storj.destroy();
  });
});

/* LIST ALL FILES */
router.get('/vault/:name', auth, function(req, res, next) {

  var vaultName = req.params.name;

  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: req.session.email,
   bridgePass: decrypt(SESSION_KEY, req.session.password),
   encryptionKey: 'test',
   logLevel: 4
 });

  storj.listFiles(vaultName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    return res.send({ result: result });
    //storj.destroy();
  });
});

/* Upload files */
router.get('/vault/file/upload/:vault/:filepath', auth, function(req, res, next) {
  var bucketId = req.params.vault;
  var fileP = req.params.filepath;

  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: req.session.email,
   bridgePass: decrypt(SESSION_KEY, req.session.password),
   encryptionKey: 'test',
   logLevel: 4
 });

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

router.get('/vault/file/download/:vault/:fileid', auth, function(req, res, next) {


  var bucketId = req.params.vault;
  var fileId = req.params.fileid;
  var downloadFilePath = './test.js';

  storj = new Environment({
   bridgeUrl: DIGIPULSE_HUB,
   bridgeUser: req.session.email,
   bridgePass: decrypt(SESSION_KEY, req.session.password),
   encryptionKey: 'test',
   logLevel: 4
 });

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
      //return res.send({ result: 'fileId' });
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
