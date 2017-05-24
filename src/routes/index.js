const express = require('express');
const multer = require('multer');

const user = require('./user');
const token = require('./token');
const artist = require('./artist');
const album = require('./album');
const track = require('./track');
const admin = require('./admin');

const loginRouter = require('../middlewares/login-router');
const usersMediaLocation = multer({dest: 'public/media/users/'});

const router = express.Router();

router.get('/', (req, res) => res.render('index'));

/* Users */

router.get('/api/users/me', user.meGetUser);

router.put('/api/users/me', user.meUpdateUser);

router.get('/api/users/me/contacts', user.meGetContacts);

router.get('/api/users', user.getUsers);

router.get('/api/users/:id', user.getUser);

router.post('/api/users', usersMediaLocation.single('avatar'), user.newUser);

router.put('/api/users/:id', user.updateUser);

router.delete('/api/users/:id', user.deleteUser);

/* Admins */

router.get('/api/admins', admin.getAdmins);

router.post('/api/admins', admin.newAdmin);

router.delete('/api/admins/:id', admin.deleteAdmin);

/* Tokens */

router.post('/api/tokens', loginRouter, token.generateToken);

router.post('/api/admins/tokens', token.generateAdminToken);

/* Artists */

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', artist.newArtist);

router.get('/api/artists/:id', artist.getArtist);

router.put('/api/artists/:id', artist.updateArtist);

router.delete('/api/artists/:id', artist.deleteArtist);

/* Tracks */

router.get('/api/tracks', track.getTracks);

router.post('/api/tracks', track.newTrack);

router.get('/api/tracks/:id', track.getTrack);

router.put('/api/tracks/:id', track.updateTrack);

router.delete('/api/tracks/:id', track.deleteTrack);

router.post('/api/tracks/:id/like', track.trackLike);

router.delete('/api/tracks/:id/like', track.trackDislike);

router.get('/api/tracks/me/favorites', track.getFavoriteTracks);

router.get('/api/tracks/:id/popularity', track.getTrackPopularity);

router.post('/api/tracks/:id/popularity', track.rateTrack);

/* Albums */

router.get('/api/albums', album.getAlbums);

router.get('/api/albums/:id', album.getAlbum);

router.post('/api/albums', album.newAlbum);

router.put('/api/albums/:id', album.updateAlbum);

router.delete('/api/albums/:id', album.deleteAlbum);

router.put('/api/albums/:albumId/track/:trackId', album.addTrackToAlbum);

router.delete('/api/albums/:albumId/track/:trackId', album.deleteTrackFromAlbum);

module.exports = router;
