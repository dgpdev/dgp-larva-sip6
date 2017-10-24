var sass = require('node-sass-middleware');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
    secret: 'nFbsEaDmYrP4aapJn2H7eMGBcdySnnyqJrYXUxYGmKRfdUh8Fq36RGXFDj7xDE3QH3fMJa36yr5umUnPJfPcgj9qDGeW65f5KxsK6B54bbGxLDEKAK5XYGN7ALbW9WcK',
    resave: false,
    saveUninitialized: true
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(fileUpload());
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist'));
//app.use('/clipboard', express.static(__dirname + '/node_modules/clipboard/dist'));
app.use(cookieParser());

app.use(
  sass({
    src: __dirname + '/sass/main',
    dest: __dirname + '/public/stylesheets',
    prefix:  '/stylesheets',
    debug: true
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
