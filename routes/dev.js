/* DIGIPULSE ALPHA SIP5 + SIP6 IMPLENTATION
 * This code combines SIP5 + SIP6 and will be known as SIP7
 *
 * DO NOT FORGET TO SET A NEW SESSION_KEY BEFORE LIVE STAGE !!!
 * Code by Steve Walschot
 */
var express = require('express');
var router = express.Router();

// NPM INSTALL NODE-FS-EXTRA
var fs = require('fs-extra');

var crypto = require('crypto');

/* DEVELOPMENT SWITCH;
 * Use only local filesystem when true, DGP network when false
 */
var isDev = false;

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = 'http://alpha.digipulse.io:8080';
var SESSION_KEY = 'x6mJac43QZY93bCGu69XX9h8hFB2T5Z2pdpafrc52Gu7CfnQHPYE5KCY5acD4YB46SfCJSQK8699M8NtBbaFeCMp2gPMK2pWSUEZwxuTqYMwV34XE8fv9ar3tuBfz3QRr7vqAM8c6Fb72EheKR4UW5U79WMJ7d7RFjzFt9CcHkVnTZmBdJT7sEaexbMfqmzNcEvaxa9WBrZBBjn8UNe8Sd9sckEpccKjE4rZsUJSBnDnTnB8U5UquXMs7X7KkSbM'
var client;
var keypair;

// SIP6
const {
  Environment
} = require('storj');
var storj;

/* MULTER UPLOAD TESTING
 * Should improve images
 */
var multer = require('multer');

const tmpDir = '/temp';

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var randomFolder = genRandomString(24);
    var tmpPath = '/home/steve/dgp-larva-sip6' + tmpDir + '/' + randomFolder;
    fs.mkdirsSync(tmpPath)
    cb(null, tmpPath)
  },
  filename: function(req, file, callback) {
    console.log(file)
    callback(null, file.originalname)
  }
});

var upload = multer({
  storage: storage
});

// END multer

function LoginSIP5(user, pass) {
  return false;
}

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

var genRandomString = function(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

var auth = function(req, res, next) {
  if (req.session && req.session.authed)
    return next();
  else
    console.log('Session NOT found');
  return res.render('dev/login');
  //return res.send({ status: 'fail', message: 'not logged in to DigiPulse network' });
};

/* LOGOUT */
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    return res.send({
      status: 'success'
    });
  });
});



/* GET GENERAL INFO */
router.get('/', auth, function(req, res, next) {

  return res.render('dev/index');
  //return res.send({ result: result });

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
    return res.send({
      result: result
    });
    storj.destroy();
  });
});


/* Login with user:pass
 * @dev: Working with AJAX.
*/
router.post('/login', function(req, res, next) {

  /* This is the only stage where the password is needed in plaintext.
   *  Once sent to the sessios, it get's encrypted by the SESSION_KEY.
   */

  // SIP5 basic login
  var user = {
    email: req.body.user,
    password: req.body.pass
  };
  console.log(user);


  var client = storjlib.BridgeClient(DIGIPULSE_HUB, {
    basicAuth: user
  });
  var keypair = storjlib.KeyPair();

  client.addPublicKey(keypair.getPublicKey(), function(err) {
    if (err) {
      req.session.destroy();
      return res.send({
        status: 'fail',
        message: err.message
      });
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
        req.session.destroy();
        return res.send({
          status: 'fail',
          message: err.message
        });
      }
      // UX return
      //return res.render('index', {result: result});
      // PLAIN TEST RETURN
      return res.send({
        status: 'success',
        message: 'Login success'
      });
    });
  });
});


/* List all vaults
 * @dev: Working with AJAX.
*/
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
      return res.send({
        status: 'fail',
        message: err.message
      });
    }
    return res.send({
      status: 'success',
      result: result
    });
  });
});


/* List all files in drive
 * @dev: Working with AJAX.
*/
router.post('/vault', auth, function(req, res, next) {

  var vaultName = req.body.driveID;

  storj = new Environment({
    bridgeUrl: DIGIPULSE_HUB,
    bridgeUser: req.session.email,
    bridgePass: decrypt(SESSION_KEY, req.session.password),
    encryptionKey: 'test',
    logLevel: 4
  });

  storj.listFiles(vaultName, function(err, result) {
    if (err) {
      return res.send({
        status: 'fail',
        message: err.message
      });
    }
    return res.send({
      status: 'success',
      result: result
    });
    //storj.destroy();
  });
});


/* Upload files
 * @dev: Working with AJAX.
 * @info Current code does NOT support multiple files. Loop will be required if needed.
 * Advice: using XHR we can track progress update in browser
*/
router.post('/vault/upload', auth, upload.any(), function(req, res, next) {

  if (isDev) {
    console.log(req.body);
    // example output:{ vaultID: '000000000000' }
    console.log(req.files); //form files
    // example output:{ fieldname: 'upl',originalname: 'grumpy.png',encoding: '7bit',mimetype: 'image/png',destination: './uploads/',filename: '436ec561793aa4dc475a88e84776b1b9',path: 'uploads/436ec561793aa4dc475a88e84776b1b9',size: 277056 }
    return res.send({
      status: 'success',
      result: req.files
    });
    //res.status(204).end();
  } else {

    var bucketId = req.body.driveID;
    var files = req.files;

    if (files) {
      files.forEach(function(file) {
        console.log('-----------------------------------------');
        console.log(file);
        console.log('-----------------------------------------');

        var uploadFilePath = file.path;
        var fileName = file.filename;

        storj = new Environment({
          bridgeUrl: DIGIPULSE_HUB,
          bridgeUser: req.session.email,
          bridgePass: decrypt(SESSION_KEY, req.session.password),
          encryptionKey: 'test',
          logLevel: 4
        });

        storj.storeFile(bucketId, uploadFilePath, {
          filename: fileName,
          progressCallback: function(progress, uploadedBytes, totalBytes) {
            console.log('Progress: %d, uploadedBytes: %d, totalBytes: %d',
              progress, uploadedBytes, totalBytes);
          },
          finishedCallback: function(err, fileId) {
            if (err) {
              return res.send({status: 'fail',message: err.message});
            }
            // Remove file stored on system
            fs.removeSync(file.destination );
            return res.send({status: 'success',result: fileId});
          }
        });
      });
    }



  }

});


/* Download files
 * @dev: Working with AJAX.
*/
router.post('/vault/download', auth, function(req, res, next) {


  try {
      var randomFolder = genRandomString(24);
      var tmpPath = '/home/steve/dgp-larva-sip6'  + tmpDir + '/' + randomFolder;
      console.log(tmpPath);
      if (!fs.existsSync(tmpPath)){
            fs.mkdirSync(tmpPath);
        }


    var bucketId = req.body.driveID;
    var fileId = req.body.fileID;
    var downloadFilePath = tmpPath + '/' + req.body.fileNAME;

    console.log('init download' + downloadFilePath);
  } catch (err) {
    console.log (err);
  }

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
          return res.send({ status: 'fail', message: err.message });
        }

        //res.download(downloadFilePath);
        //fsextra.removeSync(tmpPath);
        return res.send({ status: 'success', message: 'download complete', tmp:randomFolder  });

        //return res.send({ result: 'fileId' });
        //storj.destroy();
      }
    });


});


/* Download file to client browser
 * @dev: Working with AJAX.
 * Advice: beautify
*/
router.get('/download/:tmp/:file', function(req, res, next) {

    var fileNAME = '/home/steve/dgp-larva-sip6/temp/' + req.params.tmp + '/' +req.params.file;

    res.download(fileNAME, function(err) {
      if (err) {
      // Handle error, but keep in mind the response may be partially-sent
      // so check res.headersSent
    } else {
      fs.removeSync('/home/steve/dgp-larva-sip6/temp/' + req.params.tmp );
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
