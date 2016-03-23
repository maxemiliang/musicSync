var express = require('express');
var router = express.Router();
var fs = require('fs-plus');
var password = require('password-hash-and-salt');
var multer  = require('multer');
var upload = multer({ dest: 'music/'});
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
    res.render('index', {loggedIn: req.session.loggedIn, username: req.session.username});
});

router.get('/register', function(req, res, next) {
    res.render('register', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username});
});

router.get('/login', function(req, res, next) {
    res.render('login', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username});
});

router.get('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/');
});

router.get('/profile/:id', function(req, res, next) {
    res.send('username: ' + req.params.id);
});

router.get('/add', function(req, res, next){
   res.render('upload', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username}); 
});

router.post('/upload', function(req, res, next){
    console.log(req.files);
});

router.post('/login', function(req, res, next) {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, results){
        if (err) throw err;

        if(results.length > 0) {
            password(req.body.password).verifyAgainst(results[0]['password'], function(err, verified) {
                if(err) throw new Error('Something happened!');
                if(verified) {
                    req.session.userID = results[0]['uID'];
                    req.session.username = results[0]['username'];
                    req.session.loggedIn = true;
                    res.redirect('/');
                } else {
                    req.flash('err', 'Password or username is wrong');
                    res.redirect('/login'); 
                }
            });        
        } else {
            req.flash('err', 'Password or username is wrong');
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
                req.flash('err', 'username not available');
                res.redirect('/register');
            }
        });
    } else {
        req.flash('err', 'Username needs to be longer than 5 characters and password needs to be longer than 7 characters!');
        res.redirect('/register');
    }
});


module.exports = router;
