const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (playlistId, tracksIds) => {
  logger.debug(`Creating associations for playlist ${playlistId} and tracks ${tracksIds}`);
  const rowValues = tracksIds.map(id => ({ track_id: id, playlist_id: playlistId }));
  return generalHandler.createNewEntry(tables.playlists_tracks, rowValues);
};

const deleteAssociationsOfPlaylist = playlistId => {
  logger.debug(`Deleting playlist ${playlistId} associations`);
  return db(tables.playlists_tracks).where('playlist_id', playlistId).del();
};

const updateAssociations = (playlistId, tracksIds) => deleteAssociationsOfPlaylist(playlistId)
    .then(() => insertAssociations(playlistId, tracksIds));

const findTracksIdsFromPlaylist = playlistId =>
  db(tables.playlists_tracks).where('playlist_id', playlistId).select('track_id');

const addTrack = (playlistId, trackId) => {
  logger.debug(`Creating association for playlist ${playlistId} and track ${trackId}`);
  return generalHandler.createNewEntry(tables.playlists_tracks, {
    track_id: trackId,
    playlist_id: playlistId,
  });
};

const deleteTrack = (playlistId, trackId) => {
  logger.debug(`Deleting track ${trackId} from playlist ${playlistId}`);
  return db(tables.playlists_tracks).where({ playlist_id: playlistId, track_id: trackId }).del();
};

const deleteAssociationsOfTrack = trackId => {
  logger.debug(`Deleting track ${trackId} associations`);
  return db(tables.playlists_tracks).where('track_id', trackId).del();
};

module.exports = {
  insertAssociations,
  updateAssociations,
  deleteAssociationsOfPlaylist,
  findTracksIdsFromPlaylist,
  addTrack,
  deleteTrack,
  deleteAssociationsOfTrack,
};
