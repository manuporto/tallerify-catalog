const logger = require('../utils/logger');
// const models = require('../models/index');

// const getArtists = (req, res) => {
//   models.artists.findAll({}).then((artists) => {
//     res.status(200).json(artists);
//   }).catch((reason) => {
//     const message = `Unexpected error: ${reason}`;
//     logger.warn(message);
//     res.status(500).json({ code: 500, message });
//   });
// };

// const postArtist = (req, res) => {
//   logger.info(`Post /artists with query ${JSON.stringify(req.body, null, 4)}`);
//   models.artists.create({
//     name: req.body.name,
//     description: req.body.description,
//     genres: req.body.genres,
//     images: req.body.images,
//   }).then((artist) => {
//     res.status(200).json(artist);
//   });
// };

const db = require('../database/');
const tables = require('../database/tableNames');

function getArtists(req, res) {
  db.select().from(tables.artists).then(artists => {
    res.status(200).json(artists);
  });
}

function postArtist(req, res) {
  db(tables.artists).returning('*').insert({
    name: req.body.name,
    popularity: req.body.popularity
  }).then(artist => {
    res.status(200).json(artist);
  })
}

module.exports = { getArtists, postArtist };
