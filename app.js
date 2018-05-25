var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var FONTS = require('cfonts')


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'oeffsoidfsgodfjgoejfoeifsjfjsofjeofdobjfborogfojfoefjsfisjfisejfosdijf',
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  },
  resave: false
}));
app.use(flash());
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = '<h1>Error 404 Not found!</h1><br><a href="/">Go back to safety</a>'
  res.send(err);
});

// error handlers


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var sweg = new FONTS({
  'text': 'Sync Music', //text to be converted
  'font': 'block', //define the font face
  'color': 'blue, green',
  'background': '',
  'letterSpacing': 1, //define letter spacing
  'space': true, //define if the output text should have empty lines on top and on the bottom
  'maxLength': '5' //define how many character can be on one line
});

// eslint-disable-next-line
console.log(sweg);

module.exports = app;