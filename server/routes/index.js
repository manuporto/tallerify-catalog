const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const models = require('../models/index');
const user = require('./user');
const token = require('./token');
const artist = require('./artist');
const track = require('./track');
const album = require('./album');

router.get('/', (req, res, next) => {
  res.render('index');
});

/* Users */

router.get('/api/users', user.getUsers);

router.get('/api/users/:id', user.getUser);

router.post('/api/users', user.newUser);

router.put('/api/users/:id', user.updateUser);

router.delete('/api/users/:id', user.deleteUser);

/* Tokens */

router.post('/api/tokens', token.generateToken);

/* Artists */

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', artist.postArtist);

/* Albums */

router.post('/api/albums', album.postAlbum);

/* Tracks */

router.post('/api/tracks', track.postTrack);

module.exports = router;
