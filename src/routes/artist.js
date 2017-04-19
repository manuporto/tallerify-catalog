const logger = require('../utils/logger');
const common = require('./common');
const constants = require('./constants.json');
const db = require('../database/');
const tables = require('../database/tableNames');

const artistExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    popularity: {
      required: true,
      type: 'integer',
    }
  }
};

function successfulArtistsFetch(artists, response) {
  logger.info('Successful artists fetch');
  return response.status(200).json({
    metadata: {
      count: artists.length,
      version: constants.API_VERSION,
    },
    artists,
  });
}

function getArtists(req, res) {
  db.select().from(tables.artists).then(artists => successfulArtistsFetch(artists, res));
}

function newArtist(req, res) {
  db(tables.artists).returning('*').insert({
    name: req.body.name,
    popularity: req.body.popularity
  }).then(artist => {
    res.status(200).json(artist);
  })
}

module.exports = { getArtists, newArtist };
