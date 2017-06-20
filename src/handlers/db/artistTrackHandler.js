const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (trackId, artistsIds) => {
  logger.debug(`Creating associations for track ${trackId} and artists ${artistsIds}`);
  const rowValues = artistsIds.map(id => ({ track_id: trackId, artist_id: id }));
  return generalHandler.createNewEntry(tables.artists_tracks, rowValues);
};

const deleteAssociationsOfTrack = trackId => {
  logger.debug(`Deleting track ${trackId} associations`);
  return db(tables.artists_tracks).where('track_id', trackId).del();
};

const updateAssociations = (trackId, artistsIds) => deleteAssociationsOfTrack(trackId)
    .then(() => insertAssociations(trackId, artistsIds));

const findArtistsIdsFromTrack = trackId => db(tables.artists_tracks).where('track_id', trackId).select('artist_id');

const deleteAssociationsOfArtist = artistId => {
  logger.debug(`Deleting artist ${artistId} associations`);
  return db(tables.albums_artists).where('artist_id', artistId).del();
};

module.exports = {
  insertAssociations,
  updateAssociations,
  findArtistsIdsFromTrack,
  deleteAssociationsOfTrack,
  deleteAssociationsOfArtist,
};

