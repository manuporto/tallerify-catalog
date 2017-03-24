const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');
var user = require('./user');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index', { title: 'Express' });
});

router.get('/api/users', user.getUsers);

router.post('/api/users', user.postUser);

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
