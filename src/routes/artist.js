const db = require('./../handlers/db/generalHandler');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const artistExpectedBodySchema = { // FIXME incomplete schema
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    popularity: {
      required: true,
      type: 'integer',
    },
  },
};

function getArtists(req, res) {
  db.findAllEntries(tables.artists)
    .then(artists => respond.successfulArtistsFetch(artists, res))
    .catch(error => respond.internalServerError(error, res));
}

function newArtist(req, res) {
  respond.validateRequestBody(req.body, artistExpectedBodySchema)
    .then(() => {
      db.createNewEntry(tables.artists, req.body) // FIXME request body could have extra fields
        .then(artist => respond.successfulArtistCreation(artist, res))
        .catch(error => respond.internalServerError(error, res));
    }).catch(error => {
      respond.invalidRequestBodyError(error, res);
    });
}

module.exports = { getArtists, newArtist };
