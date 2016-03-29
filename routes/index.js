var express = require('express');
var router = express.Router();
var fsplus = require('fs-plus');
var fs = require('fs');
var findRemoveSync = require('find-remove');
var password = require('password-hash-and-salt');
var multer = require('multer');
var upload = multer({ dest: 'music/'});
var BinaryServer = require('binaryjs').BinaryServer;
var bserver = new BinaryServer({port: 9000, path: '/songStream'});
process.setMaxListeners(0);

var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'musick'
});

db.connect();

/*
function isLoggedin(req) {
    if (req.session.userID != null || req.session.userID != undefined || req.session.userID != '' || req.session.userID <= 0) {
        return false;
    } else {
        return true;
    }
}
*/

/* GET home page. */
router.get('/', function(req, res, next) { 
    db.query('SELECT * FROM music ORDER BY date ASC', function (err, results) {
        if (err) throw err;
        res.render('index', {loggedIn: req.session.loggedIn, username: req.session.username, msg: req.flash('succ'), songs: results});
    });
});

router.get('/register', function(req, res, next) {
    if (!req.session.loggedIn) {    
        res.render('register', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username});
    } else {
        res.redirect('/');
    }
});

router.get('/login', function(req, res, next) {
    if (!req.session.loggedIn) {
        res.render('login', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username});
    } else {
        res.redirect('/');
    }
});

router.get('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/');
});

router.get('/profile/:id', function(req, res, next) {
    if (req.session.loggedIn) {
        res.send('username: ' + req.params.id);
    } else {
        res.redirect('/');
    }

});

router.get('/add', function(req, res, next){
    if (req.session.loggedIn) {   
        res.render('upload', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username}); 
    } else {
        res.redirect('/');
    }
});

router.post('/upload', upload.single('file'), function(req, res, next){
    if (req.session.loggedIn) {
        if (req.file) {     
            if (req.file.mimetype == 'audio/mpeg') {
                if (req.body.title.length > 0 && req.body.artist.length > 0 && req.body.album.length > 0) {
                    db.query('INSERT INTO music (title, artist, album, location, uID, date) VALUES (?, ?, ?, ?, ?, NOW())', [req.body.title, req.body.artist, req.body.album, req.file.filename, req.session.userID], function(err) {
                        if (err) throw err;
                        console.log('OH HELLOO!!');
                        req.flash('succ', 'Song uploaded successfully!');
                        res.redirect('/');
                    });
                } else {
                    req.flash('err', 'Please insert info about this file!');
                    res.redirect('/add');
                }
            } else {
                findRemoveSync('music', {files: req.file.filename});
                req.flash('err', 'Not a mpeg file!');
                res.redirect('/add');
            }
        } else {
            req.flash('err', 'Please insert a file!');
            res.redirect('/add');
        }
    } else {
        res.redirect('/');
    }
});

router.post('/login', function(req, res, next) {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, results){
        if (err) throw err;

        if(results.length > 0) {
            password(req.body.password).verifyAgainst(results[0]['password'], function(err, verified) {
                if (err) throw new Error('Something happened!');
                if (verified) {
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
    if(req.body.username.length > 5 && req.body.password.length > 7 && !req.session.loggedIn) {
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
