const logger = require('../utils/logger');
const db = require('./../handlers/db');
const tables = require('../database/tableNames');
const dbHandlers = require('./../handlers/db/index');
const respond = require('./../handlers/response');

const getTracks = (req, res) => {
  db.findAllEntries(tables.tracks)
    .then(tracks => respond.succesfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const newTrack = (req, res) => {
  dbHandlers.track.insertTrack(req.body) // FIXME validate body
    .then((track) => {
      logger.info(`Track: ${JSON.stringify(track, null, 4)}`); // FIXME move this to response handler
      res.status(201).json(track);
    });
};

module.exports = { getTracks, newTrack };
