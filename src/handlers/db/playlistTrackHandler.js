const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (playlistId, tracksIds) => {
  logger.debug(`Creating associations for playlist ${playlistId} and tracks ${tracksIds}`);
  const rowValues = tracksIds.map(id => ({ track_id: id, playlist_id: playlistId }));
  return generalHandler.createNewEntry(tables.playlists_tracks, rowValues);
};

const deleteAssociations = playlistId => {
  logger.debug(`Deleting track ${playlistId} associations`);
  return db(tables.playlists_tracks).where('playlist_id', playlistId).del();
};

const updateAssociations = (playlistId, tracksIds) => deleteAssociations(playlistId)
    .then(() => insertAssociations(playlistId, tracksIds));

const findTracksIdsFromPlaylist = playlistId => db(tables.playlists_tracks).where('playlist_id', playlistId).select('track_id');

module.exports = { insertAssociations, updateAssociations, deleteAssociations, findTracksIdsFromPlaylist };
