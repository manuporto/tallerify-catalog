const logger = require('../utils/logger');
const common = require('./common');
const constants = require('./constants.json');
const db = require('../database/');
const dbHandler = require('../dbHandler');
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

function successfulArtistsFetch(artists, res) {
  logger.info('Successful artists fetch');
  return res.status(200).json({
    metadata: {
      count: artists.length,
      version: constants.API_VERSION,
    },
    artists,
  });
}

function successfulArtistCreation(artist, res) {
  logger.info('Successful artist creation');
  res.status(201).json(artist);
}

function getArtists(req, res) {
  dbHandler.artist.selectAllArtists()
    .then(artists => successfulArtistsFetch(artists, res))
    .catch(error => common.internalServerError(error, res));
}

function newArtist(req, res) {
  common.validateRequestBody(req.body, artistExpectedBodySchema).then(() => {
    dbHandler.artist.insertArtist(req.body)
      .then(artist => successfulArtistCreation(artist, res))
      .catch(error => common.internalServerError(error, res));
  }).catch(error => common.invalidRequestBodyError(error, res));
}

module.exports = { getArtists, newArtist };
