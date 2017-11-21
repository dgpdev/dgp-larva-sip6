var session = require('express-session');

var greet = require("../modules/dgp_encryption.js");
var greetings = new greet();

var dgpAuth = function() {};

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = 'http://alpha.digipulse.io:8080';
var SESSION_KEY = 'x6mJac43QZY93bCGu69XX9h8hFB2T5Z2pdpafrc52Gu7CfnQHPYE5KCY5acD4YB46SfCJSQK8699M8NtBbaFeCMp2gPMK2pWSUEZwxuTqYMwV34XE8fv9ar3tuBfz3QRr7vqAM8c6Fb72EheKR4UW5U79WMJ7d7RFjzFt9CcHkVnTZmBdJT7sEaexbMfqmzNcEvaxa9WBrZBBjn8UNe8Sd9sckEpccKjE4rZsUJSBnDnTnB8U5UquXMs7X7KkSbM'
var client;
var keypair;

// SIP6
const {Environment} = require('storj');
var storj;

function storeSessionKey(req, key, user) {
  req.session.authed = true;
  req.session.keypair = key;
  req.session.email = user.email;
  req.session.password = greetings.encrypt(SESSION_KEY, user.password);
}

function storeSessionPassphrase(req, key, user) {
  req.session.passphrase = greetings.encrypt(SESSION_KEY, user.password);
}

module.exports = {
  login: function(req, res, userObject) {
    var user = {email: userObject.user,password: userObject.pass};
    var client = storjlib.BridgeClient(DIGIPULSE_HUB, {basicAuth: user});
    var keypair = storjlib.KeyPair();

    client.addPublicKey(keypair.getPublicKey(), function(err) {

      if (err) {
        //req.session.destroy();        return res.json({
          status: 'fail',
          message: err.message
        });
      }

      storeSessionKey(req, keypair.getPrivateKey(), user);

      storj = new Environment({
        bridgeUrl: DIGIPULSE_HUB,
        bridgeUser: req.session.email,
        bridgePass: greetings.decrypt(SESSION_KEY, req.session.password),
        encryptionKey: 'test1',
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

        // Are the vaults decrypted or do we need a special passphrase?
        result.forEach(function(file) {
          console.log(file.decrypted);
        });
        // UX return
        //return res.render('index', {result: result});
        // PLAIN TEST RETURN
        return res.json({
          status: 'success',
          message: result
        });
      });

    });

  }
}
