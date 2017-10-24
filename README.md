Digipulse Larva SIP6
--------------------

## Testing the code
**For testing purposes the code only accepts `GET`commands.**

If **authentication** is needed, please use it inside the url.
For example: `/login/email/pass` for login.

When **uploading** a file, please make sure it's inside your application `root` folder and pass it on as URL parameter. For example `/vault/file/upload/:vault/:filepath` where `filepath` is your filename. 

You should input the vault's ID in the `/:vault` sections, for example `/vault/file/upload/0000000000000/test.txt`.

To **download** the file, use `/vault/file/download/:vault/:fileid` in the same way as upload. Please **note that you should change** the `var downloadFilePath = './test.js';` to match your file extention. If you download a `.txt` file, you should name it `test.txt` instead.


## Installing Storj SIP6 sources
The current installation process can be some hassle if you have the incorrect Nodejs or NPM installed.
It will fail to install when using NVM. 

To install the SIP6 sources, use `npm install github:storj/node-libstorj --save ` and install them globally.

Currently, no other options are available yet.


## Dual storj packages

The code runs on both the SIP5 as the SIP6 packages provided by Storj.

To distinct both versions, different names have been used. For the SIP5 code, we declare `var storjlib = require('storj-lib');`

To declare the SIP6 package, we use `const { Environment } = require('storj');`


## SIP workflow

All file manipulations **must** be handled by the SIP6 package. This flow will show it more clearly.

![alt text](https://github.com/dgpdev/dgp-larva-sip6/blob/master/SIP.jpg)


## Security improvements

The password will be sent only **once** to the server during login where it's encrypted using a 256 character passphrase even before it's stored in the user session. From this point on, the user session is secured.

The password will then be decrypted serverside, away from the dangerous worldwide web.
