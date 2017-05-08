const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (trackId, artistsIds) => {
  logger.info(`Creating associations for track ${trackId} and artists ${artistsIds}`);
  let rowValues = [];
  artistsIds.forEach((id) => {
    rowValues.push({
      track_id: trackId,
      artist_id: id,
    });
  });
  return generalHandler.createNewEntry(tables.artists_tracks, rowValues);
};

const deleteAssociations = (trackId) => {
  logger.info(`Deleting track ${trackId} associations`);
  return db(tables.artists_tracks).where('track_id', trackId).del();
};

const updateAssociations = (trackId, artistsIds) => {
  return deleteAssociations(trackId)
    .then(() => insertAssociations(trackId, artistsIds));
};

module.exports = { insertAssociations, updateAssociations };
