const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index', { title: 'Express' });
});

/* Users */

router.get('/api/users', (req, res) => {
  winston.log('info', `Get /users`);
  models.User.findAll({}).then(users => {
      winston.log('info', `Response: ${res}`);
      res.status(200).json(users);
    }).catch(reason => {
      winston.log('warn', `Error when doing /users query: "${reason}"`);
      res.status(500);
  });
});

router.post('/api/users', (req, res) => {
  winston.log('info', `Post /users with query ${JSON.stringify(req.body, null, 4)}`);
  models.User.create({
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    country: req.body.country,
    email: req.body.email,
    birthdate: req.body.birthdate,
    images: req.body.images
  }).then(user => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(user);
  });
});

/* Artists */

router.get('/api/artists', (req, res) => {
  winston.log('info', `Get /artists`);
  models.Artist.findAll({}).then(artists => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artists);
  }).catch(reason => {
    winston.log('warn', `Error when doing /artists query: "${reason}"`);
    res.status(500);
  });
});

router.post('/api/artists', (req, res) => {
  winston.log('info', `Post /artists with query ${JSON.stringify(req.body, null, 4)}`);
  models.Artist.create({
    name: req.body.name,
    description: req.body.description,
    genres: req.body.genres,
    images: req.body.images
  }).then(artist => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artist);
  });
});

/* Tracks */

router.post('/api/tracks', (req, res) => {
  winston.log('info', `Post /tracks with query ${JSON.stringify(req.body, null, 4)}`);
  models.Track.create({
    albumId: req.body.albumId,
    artists: req.body.artists,
    name: req.body.name
  }).then(track => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(track);
  });
});

module.exports = router;
