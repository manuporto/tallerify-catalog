const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const artistExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    description: {
      required: true,
      type: 'string',
    },
    genres: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
    images: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

function getArtists(req, res) {
  db.general.findAllEntries(tables.artists)
    .then(artists => respond.successfulArtistsFetch(artists, res))
    .catch(error => respond.internalServerError(error, res));
}

function newArtist(req, res) {
  respond.validateRequestBody(req.body, artistExpectedBodySchema)
    .then(() => {
      db.artist.createNewArtistEntry(req.body)
        .then(artist => respond.successfulArtistCreation(artist, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
}

module.exports = { getArtists, newArtist };
