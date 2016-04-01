var express = require('express');
var router = express.Router();
var fsplus = require('fs-plus');
var fs = require('fs');
var findRemoveSync = require('find-remove');
var password = require('password-hash-and-salt');
var multer = require('multer');
var upload = multer({ dest: 'public/music/'});
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
    db.query('SELECT * FROM music ORDER BY date DESC', function (err, results) {
        if (err) throw err;
        res.render('index', {loggedIn: req.session.loggedIn, username: req.session.username, msg: req.flash('succ'), songs: results, err: req.flash('err')});
    });
});

router.get('/download/:file', function(req, res, next) {
    var file = 'public/music/' + req.params.file;
    if (fsplus.existsSync(file)) {    
        res.download(file);
    } else {
        res.status(404);
        req.flash('err', 'File not found..');
        res.redirect('/');
    }
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

router.get('/playlist/add/:id', function(req, res, next){
    if(req.session.loggedIn) {    
        db.query('SELECT * FROM playlist WHERE owner=?', [req.session.userID], function(err, results){
            if (err) throw err;
            res.render('addplay', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username, result: results});
        });
    } else {
        res.redirect('/');
    }
});

router.get('/album/:id', function(req, res, next) {
    db.query('SELECT music.*, users.username FROM music LEFT JOIN users ON users.username=music.username WHERE music.album=?', [req.params.id], function(err, results) {    
        if (err) throw err;
        res.render('album', {album: results, loggedIn: req.session.loggedIn});
    });
});

router.get('/add', function(req, res, next){
    if (req.session.loggedIn) {   
        res.render('upload', {err: req.flash('err'), loggedIn: req.session.loggedIn, username: req.session.username}); 
    } else {
        res.redirect('/');
    }
});

router.get('/playlists', function(req, res, next){
    if (req.session.loggedIn) {
        db.query('SELECT * FROM playlist', function(err, results){
            res.render('playlists', {lists: results, err: req.flash('err'), msg: req.flash('succ')});
        });
    } else {
        res.redirect('/');
    }
});

router.post('/playlists', function(req, res, next){
    if (req.body.name.length > 0 && req.session.loggedIn) {
        console.log(req.session.username);
        db.query('INSERT INTO playlist (name, owner) VALUES (?, ?)', [req.body.name, req.session.userID], function(err, results){
            if (err) throw err;
            req.flash('succ', 'Created playlist: ' + req.body.name)
            res.redirect('/playlists');
        });
    } else {
        req.flash('err', 'Error: please supply a name for the playlist');
        res.redirect('/playlists');
    }
});

router.post('/upload', upload.single('file'), function(req, res, next){
    if (req.session.loggedIn) {
        if (req.file) {     
            if (req.file.mimetype == 'audio/mpeg') {
                if (req.body.title.length > 0 && req.body.artist.length > 0 && req.body.album.length > 0) {
                    db.query('INSERT INTO music (title, artist, album, location, username, date) VALUES (?, ?, ?, ?, ?, NOW())', [req.body.title, req.body.artist, req.body.album, req.file.filename, req.session.username], function(err) {
                        if (err) throw err;
                        req.flash('succ', 'Song uploaded successfully!');
                        res.redirect('/');
                    });
                } else {
                    req.flash('err', 'Please insert info about this file!');
                    res.redirect('/add');
                }
            } else {
                findRemoveSync('public/music/', {files: req.file.filename});
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
