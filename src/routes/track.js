const logger = require('../utils/logger');
const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const trackExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    albumId: {
      required: true,
      type: 'integer',
    },
    artists: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

const getTracks = (req, res) => {
  db.general.findAllEntries(tables.tracks)
    .then(tracks => respond.succesfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const newTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
  .then(() => {
    db.track.insertTrack(req.body)
      .then((track) => {
        logger.info(`Track: ${JSON.stringify(track, null, 4)}`); // FIXME move this to response handler
        res.status(201).json(track);
      })
      .catch(error => respond.internalServerError(error, res));
  })
  .catch(error => respond.invalidRequestBodyError(error, res));
};

module.exports = { getTracks, newTrack };
