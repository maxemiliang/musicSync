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
    e = false
    if (req.session.err != undefined || req.session.err != '') {
        e = true
    } else {
        e = false
    }
    res.render('index', {error: req.session.err, err: e});
    req.session.err = '';
});

router.get('/register', function(req, res, next) {
    e = false
    if (req.session.err != undefined || req.session.err != '') {
        e = true
    } else {
        e = false
    }
    res.render('register', {error: req.session.err, err: e});
    req.session.err = '';
});

router.get('/login', function(req, res, next) {
    e = false
    if (req.session.err != undefined || req.session.err != '') {
        e = true
    } else {
        e = false
    }
    res.render('login', {error: req.session.err, err: e});
    req.session.err = '';
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
                    req.session.err = 'Password or username was wrong!';
                    res.redirect('/login'); 
                }
            });        
        } else {
            req.session.err = 'Password or username was wrong!';
            res.redirect('/login');
        }
    });
});

router.post('/register', function(req, res, next) {
	var hashed;
    if(req.body.username.length > 5 && req.body.password.length > 7) {
        db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, result){
            if (result.length == 0){
                password(req.body.password).hash(function(err, hash){
                    if (err) throw new Error('Something happened!');
                    hashed = hash;
                    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, hashed], function(err, results){
                        if (err) throw err;
                        res.redirect('/');
                    })
                });
            } else {
                req.session.err = 'Username taken!';
                res.redirect('/register');
            }
        });
    } else {
        req.session.err = 'Username needs to be longer than 5 characters and password needs to be longer than 7characters!';
        res.redirect('/register');
    }
});


module.exports = router;
