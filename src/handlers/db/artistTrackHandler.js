const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (trackId, artistsIds) => {
  logger.info(`Creating associations for track ${trackId} and artists ${artistsIds}`);
  const rowValues = artistsIds.map(id => ({ track_id: trackId, artist_id: id }));
  return generalHandler.createNewEntry(tables.artists_tracks, rowValues);
};

const deleteAssociations = (trackId) => {
  logger.info(`Deleting track ${trackId} associations`);
  return db(tables.artists_tracks).where('track_id', trackId).del();
};

const updateAssociations = (trackId, artistsIds) => deleteAssociations(trackId)
    .then(() => insertAssociations(trackId, artistsIds));

const findArtistsIdsFromTrack = trackId => db(tables.artists_tracks).where('track_id', trackId).select('artist_id');

module.exports = { insertAssociations, updateAssociations, findArtistsIdsFromTrack };
