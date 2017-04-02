const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');
var user = require('./user');
var artist = require('./artist');
var track = require('./track');
var album = require('./album');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index');
});

/* Users */

router.get('/api/users', user.getUsers);

router.post('/api/users', user.postUser);

/* Artists */

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', artist.postArtist);

/* Albums */

router.post('/api/albums', album.postAlbum);

/* Tracks */

router.post('/api/tracks', track.postTrack);

module.exports = router;
