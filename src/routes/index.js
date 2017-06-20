const express = require('express');
const multer = require('multer');

const user = require('./user');
const token = require('./token');
const artist = require('./artist');
const album = require('./album');
const track = require('./track');
const admin = require('./admin');
const playlist = require('./playlist');

const loginRouter = require('../middlewares/login-router');

const artistsMediaLocation = multer({ dest: 'public/media/artists/' });
const albumsMediaLocation = multer({ dest: 'public/media/albums/' });
const usersMediaLocation = multer({ dest: 'public/media/users/' });
const tracksTempMediaLocation = multer({ dest: 'public/media/tracks/' });
var guard = require('express-jwt-permissions')();
const router = express.Router();

router.get('/', (req, res) => res.render('index'));

/* Users */

router.get('/api/users/me', user.meGetUser);

router.put('/api/users/me', user.meUpdateUser);

router.get('/api/users/me/contacts', user.meGetContacts);

router.post('/api/users/me/contacts/:id', user.meAddContact);

router.delete('/api/users/me/contacts/:id', user.meDeleteContact);

router.get('/api/users', user.getUsers);

router.get('/api/users/:id', user.getUser);

router.post('/api/users', usersMediaLocation.single('avatar'), user.newUser);

router.put('/api/users/:id', user.updateUser);

router.delete('/api/users/:id', user.deleteUser);

/* Admins */

router.get('/api/admins', admin.getAdmins);

router.post('/api/admins', admin.newAdmin);

router.delete('/api/admins/:id', guard.check('admin'), admin.deleteAdmin);

/* Tokens */

router.post('/api/tokens', loginRouter, token.generateToken);

router.post('/api/admins/tokens', token.generateAdminToken);

/* Artists */

router.get('/api/artists/recommended', artist.getRecommendedArtists);

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', guard.check('admin'), artistsMediaLocation.single('picture'), artist.newArtist);

router.get('/api/artists/:id', artist.getArtist);

router.put('/api/artists/:id', guard.check('admin'), artist.updateArtist);

router.delete('/api/artists/:id', guard.check('admin'), artist.deleteArtist);

router.get('/api/artists/me/favorites', artist.getFavoriteArtists);

router.delete('/api/artists/me/:id/follow', artist.artistUnfollow);

router.post('/api/artists/me/:id/follow', artist.artistFollow);

router.get('/api/artists/:id/tracks', artist.getTracks);

/* Tracks */

router.get('/api/tracks/recommended', track.getRecommendedTracks);

router.get('/api/tracks', track.getTracks);

router.post('/api/tracks', guard.check('admin'), tracksTempMediaLocation.single('file'), track.newTrack);

router.get('/api/tracks/:id', track.getTrack);

router.put('/api/tracks/:id', guard.check('admin'), track.updateTrack);

router.delete('/api/tracks/:id', guard.check('admin'), track.deleteTrack);

router.post('/api/tracks/me/:id/like', track.trackLike);

router.delete('/api/tracks/me/:id/like', track.trackDislike);

router.get('/api/tracks/me/favorites', track.getFavoriteTracks);

router.get('/api/tracks/:id/popularity', track.getTrackPopularity);

router.post('/api/tracks/:id/popularity', track.rateTrack);

/* Playlists */

router.get('/api/playlists', playlist.getPlaylists);

router.get('/api/playlists/me', playlist.getMyPlaylists);

router.post('/api/playlists', playlist.newPlaylist);

router.get('/api/playlists/:id', playlist.getPlaylist);

router.put('/api/playlists/:id', playlist.updatePlaylist);

router.delete('/api/playlists/:id', playlist.deletePlaylist);

router.get('/api/playlists/:id/tracks', playlist.getTracks);

router.delete('/api/playlists/:id/tracks/:trackId', playlist.deleteTrackFromPlaylist);

router.put('/api/playlists/:id/tracks/:trackId', playlist.addTrackToPlaylist);

router.get('/api/playlists/:id/albums', playlist.getAlbums);

router.delete('/api/playlists/:id/albums/:albumId', playlist.deleteAlbumFromPlaylist);

router.put('/api/playlists/:id/albums/:albumId', playlist.addAlbumToPlaylist);

/* Albums */

router.get('/api/albums', album.getAlbums);

router.get('/api/albums/:id/tracks', album.getTracks);

router.get('/api/albums/:id', album.getAlbum);

router.post('/api/albums', guard.check('admin'), albumsMediaLocation.single('picture'), album.newAlbum);

router.put('/api/albums/:id', guard.check('admin'), album.updateAlbum);

router.delete('/api/albums/:id', guard.check('admin'), album.deleteAlbum);

router.put('/api/albums/:albumId/track/:trackId', guard.check('admin'), album.addTrackToAlbum);

router.delete('/api/albums/:albumId/track/:trackId', guard.check('admin'), album.deleteTrackFromAlbum);

module.exports = router;
