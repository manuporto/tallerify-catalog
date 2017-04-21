const logger = require('../utils/logger');
const common = require('./common');
const constants = require('./constants.json');
const db = require('../database');
const dbHandler = require('../dbHandler');
const tables = require('../database/tableNames');

const trackExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    duration: {
      required: true,
      type: 'integer',      
    },
    artists: {
      required: true,
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

function succesfulTracksFetch(tracks, res) {
  logger.info('Successful tracks fetch');
  return res.status(200).json({
    metadata: {
      count: tracks.length,
      version: constants.API_VERSION,
    },
    tracks,
  });
}

function getTracks(req, res) {
  dbHandler.track.selectAllTracks().then(tracks => succesfulTracksFetch(tracks, res));
}

function newTrack(req, res) {
  common.validateRequestBody(req.body, trackExpectedBodySchema)
  .then(() => {
    dbHandler.track.insertTrack(req.body)
    .then(track => {
      logger.info(`Track: ${JSON.stringify(track, null, 4)}`);
      res.status(201).json(track);
    }).catch(error => common.internalServerError(error, res));
  }).catch(error => common.invalidRequestBodyError(error, res));
}

module.exports = { getTracks, newTrack };
