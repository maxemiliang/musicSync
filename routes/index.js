const express = require('express');
const router = express.Router();
const fsplus = require('fs-plus');
const fs = require('fs');
const findRemoveSync = require('find-remove');
const password = require('password-hash-and-salt');
const multer = require('multer');
const upload = multer({
    dest: 'public/music/'
});
const BinaryServer = require('binaryjs').BinaryServer;
const bserver = new BinaryServer({
    port: 9000,
    path: '/songStream'
});
process.setMaxListeners(0);

const mysql = require('mysql');
let connectionString = process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1/musicsync';
let db;

if (process.env.INITALIZE_DB) {
    // eslint-disable-next-line global-require
    require('require-sql');
    // eslint-disable-next-line global-require
    const initDb = require('./../sql/dump.sql');
    connectionString += '?multipleStatements=true';
    db = mysql.createConnection(connectionString);
    db.query(initDb, function (err, res) {
        if (err) throw err;
        // eslint-disable-next-line no-console
        console.log(res);
        db.changeUser({
            database: 'musicsync'
        }, function (err, res) {
            if (err) throw err;
        });
    });
} else {
    db = mysql.createConnection(connectionString);
    db.changeUser({
        database: 'musicsync'
    }, function (err, res) {
        if (err) throw err;
    });
}

/*
function isLoggedin(req) {
    if (req.session.userID != null || req.session.userID != undefined || req.session.userID != '' || req.session.userID <= 0) {
        return false;
    } else {
        return true;
    }
}
*/

/**
 * GET home page. 
 */
function homePage(req, res, next) {
    db.query('SELECT * FROM music ORDER BY date DESC', function (err, results) {
        if (err) throw err;
        res.render('index', {
            loggedIn: req.session.loggedIn,
            username: req.session.username,
            msg: req.flash('succ'),
            songs: results,
            err: req.flash('err')
        });
    });
}

router.get('/', homePage);

/**
 * GET Download page. 
 * */

function downloadPage(req, res, next) {
    const file = 'public/music/' + req.params.file;
    if (fsplus.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404);
        req.flash('err', 'File not found..');
        res.redirect('/');
    }
}
router.get('/download/:file', downloadPage);

/* GET Register page. */
function registerPage(req, res, next) {
    if (!req.session.loggedIn) {
        res.render('register', {
            err: req.flash('err'),
            loggedIn: req.session.loggedIn,
            username: req.session.username
        });
    } else {
        res.redirect('/');
    }
}

router.get('/register', registerPage);

/** 
 * GET Login page. 
 */
function loginPage(req, res, next) {
    if (!req.session.loggedIn) {
        res.render('login', {
            err: req.flash('err'),
            loggedIn: req.session.loggedIn,
            username: req.session.username
        });
    } else {
        res.redirect('/');
    }
}

router.get('/login', loginPage);

/** 
 * GET Logout Handler. 
 */
function logoutHandler(req, res, next) {
    req.session.destroy();
    res.redirect('/');
}

router.get('/logout', logoutHandler);

/** 
 * GET Album page. 
 */
function albumPage(req, res, next) {
    db.query('SELECT music.*, users.username FROM music LEFT JOIN users ON users.username=music.username WHERE music.album=?', [req.params.id], function (err, results) {
        if (err) throw err;
        res.render('album', {
            album: results,
            loggedIn: req.session.loggedIn
        });
    });
}

router.get('/album/:id', albumPage);

/** 
 * GET add page. 
 */
function addPage(req, res, next) {
    if (req.session.loggedIn) {
        res.render('upload', {
            err: req.flash('err'),
            loggedIn: req.session.loggedIn,
            username: req.session.username
        });
    } else {
        res.redirect('/');
    }
}

router.get('/add', addPage);

/** 
 * POST upload handler. 
 */
function uploadHandler(req, res, next) {
    if (req.session.loggedIn) {
        if (req.file) {
            if (req.file.mimetype === 'audio/mpeg' || req.file.mimetype === 'audio/mp3') {
                if (req.body.title.length > 0 && req.body.artist.length > 0 && req.body.album.length > 0) {
                    db.query('INSERT INTO music (title, artist, album, location, username, date) VALUES (?, ?, ?, ?, ?, NOW())', [req.body.title, req.body.artist, req.body.album, req.file.filename, req.session.username], function (err) {
                        if (err) throw err;
                        req.flash('succ', 'Song uploaded successfully!');
                        res.redirect('/');
                    });
                } else {
                    req.flash('err', 'Please insert info about this file!');
                    res.redirect('/add');
                }
            } else {
                findRemoveSync('public/music/', {
                    files: req.file.filename
                });
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
}

router.post('/upload', upload.single('file'), uploadHandler);

/** 
 * POST Login Handler.
 */
function userHandler(req, res, next) {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
            password(req.body.password).verifyAgainst(results[0]['password'], function (err, verified) {
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
}
router.post('/login', userHandler);

/** 
 * POST Register Handler. 
 */
function registerHandler(req, res, next) {
    let hashed;
    if (req.body.username.length > 5 && req.body.password.length > 7 && !req.session.loggedIn) {
        db.query('SELECT * FROM users WHERE username = ?', [req.body.username], function (err, result) {
            if (result.length == 0) {
                password(req.body.password).hash(function (err, hash) {
                    if (err) throw new Error('Something happened!');
                    hashed = hash;
                    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, hashed], function (err, results) {
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
}

router.post('/register', registerHandler);


module.exports = router;