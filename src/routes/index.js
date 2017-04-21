const express = require('express');
const user = require('./user');
// const token = require('./token');
const artist = require('./artist');
const track = require('./track');
// const album = require('./album');
const admin = require('./admin');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

/* Users */

router.get('/api/users', user.getUsers);

router.get('/api/users/:id', user.getUser);

router.post('/api/users', user.newUser);

router.put('/api/users/:id', user.updateUser);

router.delete('/api/users/:id', user.deleteUser);

/* Admins */

router.get('/api/admins', admin.getAdmins);

// router.post('/api/admins', admin.newAdmin);

// router.delete('/api/admins/:id', admin.deleteAdmin);

// /* Tokens */

// router.post('/api/tokens', token.generateToken);

// router.post('/api/admins/tokens', token.generateAdminToken);

/* Artists */

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', artist.newArtist);

// /* Albums */

// router.post('/api/albums', album.postAlbum);

/* Tracks */

router.get('/api/tracks', track.getTracks);

router.post('/api/tracks', track.newTrack);

module.exports = router;
