var express = require('express');
var router = express.Router();
var fs = require('fs-plus');
var password = require('password-hash-and-salt');
process.setMaxListeners(0);

var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'musick'
});

db.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, results){
        if (err) throw err;

        if(results.length > 0) {
            password(req.body.password).verifyAgainst(results[0]['password'], function(err, verified) {
                if(err) throw new Error('Something happened!');
                if(verified) {
                    req.session.userID = results[0]['uID'];
                    res.redirect('/');
                } else {
                    res.redirect('/login'); 
                }
            });        
        } else {
            res.redirect('/login');
        }
    });
});

router.post('/register', function(req, res, next) {
	var hashed;
    if(req.body.username.length > 5 && req.body.password.length > 7) {
        password(req.body.password).hash(function(err, hash){
            if (err) throw new Error('Something happened!');
            hashed = hash;
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, hashed], function(err, results){
                if (err) throw err;
                
                res.redirect('/')
            })
        });
    } else {
        res.redirect('/register/1')
    }
});


module.exports = router;
