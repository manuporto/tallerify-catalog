const logger = require('../../utils/logger');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');

function insertAssociations(trackId, artistsIds) {
  logger.info(`Creating associations for track ${trackId} and artists ${artistsIds}`);
  let rowValues = [];
  // ex artistsIds = {"id": 1, "id": 6}
  artistsIds.forEach((id) => {
    rowValues.push({
      track_id: trackId,
      artist_id: id.id,
    });
  });
  return generalHandler.createNewEntry(tables.artists_tracks, rowValues);
}

module.exports = { insertAssociations };
