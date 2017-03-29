const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');
var user = require('./user');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index', { title: 'Express' });
});

/* Users */

router.get('/api/users', user.getUsers);

router.post('/api/users', user.postUser);

/* Artists */

router.get('/api/artists', (req, res) => {
  winston.log('info', `Get /artists`);
  models.artist.findAll({}).then(artists => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artists);
  }).catch(reason => {
    winston.log('warn', `Error when doing /artists query: "${reason}"`);
    res.status(500);
  });
});

router.post('/api/artists', (req, res) => {
  winston.log('info', `Post /artists with query ${JSON.stringify(req.body, null, 4)}`);
  models.artist.create({
    name: req.body.name,
    description: req.body.description,
    genres: req.body.genres,
    images: req.body.images
  }).then(artist => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artist);
  });
});

/* Albums */

router.post('/api/albums', (req, res) => {
  winston.log('info', `Post /albums with query ${JSON.stringify(req.body, null, 4)}`);

  models.album.create({
    name: req.body.name,
    release_date: req.body.release_date,
    genres: req.body.genres,
    images: req.body.images
  }).then(album => {
    winston.log('info', `New album created: ${album}`);

        models.album.find({
          where: {
            id : album.id
          },
          include: [{
            model: models.Artist
          }]
        }).then(function(result) {
          res.status(200).json(result);
        });

  });
});

/* Tracks */

router.post('/api/tracks', (req, res) => {
  winston.log('info', `Post /tracks with query ${JSON.stringify(req.body, null, 4)}`);
  models.track.create({
    albumId: req.body.albumId,
    artists: req.body.artists,
    name: req.body.name
  }).then(track => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(track);
  });
});

module.exports = router;
