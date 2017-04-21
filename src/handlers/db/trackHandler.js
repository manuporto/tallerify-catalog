const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const mainHandler = require('../db');
const artistHandler = require('./artistHandler');
const artistTrackHandler = require('./artistTrackHandler');

function insertTrack(track) {
  return mainHandler.createNewEntry(tables.tracks, track)
    .then((insertedTrack) => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      return artistHandler.selectAllArtistsIdsWithNames(track.artists)
        .then(ids => artistTrackHandler.insertAssociations(insertedTrack[0].id, ids))
        .then(() => insertedTrack);
    })
    .then(insertedTrack => insertedTrack);
}

module.exports = { insertTrack };
