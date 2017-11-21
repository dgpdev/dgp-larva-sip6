var crypto = require('crypto');

var DgpEncryption = function() {};


DgpEncryption.prototype.encrypt = function (key, data) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
  };

DgpEncryption.prototype.decrypt = function (key, data) {
  var decipher = crypto.createDecipher('aes-256-cbc', key);
  var decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
  }

DgpEncryption.prototype.genRandomString = function (length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

module.exports = DgpEncryption;
