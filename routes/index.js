var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'musick'
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'SyncMusic', 
  	slogan: 'We sync your music!'
  });
});

router.get('/register', function(req, res, next) {
  res.render('register', { 
  	title: 'SyncMusic', 
  	slogan: 'We sync your music!'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { 
  	title: 'SyncMusic', 
  	slogan: 'We sync your music!'
  });
});


module.exports = router;
