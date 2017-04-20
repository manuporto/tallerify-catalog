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
    db(tables.artists).
    whereIn('name', req.body.artists).select('id').then(ids => {
      const trackId = track[0].id;
      let rowValues = [];
                // ex ids = {"id": 1, "id": 6}
                ids.forEach(id => {
                  rowValues.push(
                  {
                    track_id: trackId,
                    artist_id: id.id
                  }
                  );
                });
                db(tables.artists_tracks).insert(rowValues).then(() => {
                  res.status(201).json(track);
                })
              });
  })
}

module.exports = { getTracks, newTrack };
