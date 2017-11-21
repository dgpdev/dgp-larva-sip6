/* DIGIPULSE ALPHA SIP5 + SIP6 IMPLENTATION
 * This code combines SIP5 + SIP6 and will be known as SIP7
 *
 * DO NOT FORGET TO SET A NEW SESSION_KEY BEFORE LIVE STAGE !!!
 * Code by Steve Walschot
 */

// NPM INSTALL NODE-FS-EXTRA
var fs = require('fs-extra');



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
