Digipulse Larva SIP6
--------------------

## Testing the code
For testing purposes the code only accepts `GET`commands. 

If * authentication * is needed, please use it inside the url.
For example: `/login/email/pass` for login.

When * uploading * a file, please make sure it's inside your application `root` folder and pass it on as URL parameter. For example `/vault/file/upload/:vault/:filepath` where `filepath` is your filename. 

You should input the vault's ID in the `/:vault` sections, for example `/vault/file/upload/0000000000000/test.txt`.

To * download * the file, use `/vault/file/download/:vault/:fileid` in the same way as upload. Please * note that you should change * the `var downloadFilePath = './test.js';` to match your file extention. If you download a `.txt` file, you should name it `test.txt` instead.
