const winston = require('winston');
var models = require('../models/index');

getArtists = (req, res) => {
  winston.log('info', `Get /artists`);
  models.artists.findAll({}).then(artists => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artists);
  }).catch(reason => {
    winston.log('warn', `Error when doing /artists query: "${reason}"`);
    res.status(500);
  });
};

postArtist = (req, res) => {
  winston.log('info', `Post /artists with query ${JSON.stringify(req.body, null, 4)}`);
  models.artists.create({
    name: req.body.name,
    description: req.body.description,
    genres: req.body.genres,
    images: req.body.images
  }).then(artist => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(artist);
  });
};

module.exports = { getArtists, postArtist };
