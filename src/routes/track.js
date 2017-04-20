const logger = require('../utils/logger');
const constants = require('./constants.json');
const db = require('../database');
const dbHandler = require('../dbHandler');
const tables = require('../database/tableNames');

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
  dbHandler.track.insertTrack(req.body).then(track => {
    logger.info(`Track: ${JSON.stringify(track, null, 4)}`);
    res.status(201).json(track);
  });
}

module.exports = { getTracks, newTrack };
