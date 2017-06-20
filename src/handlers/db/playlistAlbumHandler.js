const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');

const addAlbum = (playlistId, albumId) => {
  logger.debug(`Creating association for playlist ${playlistId} and album ${albumId}`);
  return generalHandler.createNewEntry(tables.playlists_albums, {
    album_id: albumId,
    playlist_id: playlistId,
  });
};

const deleteAlbum = (playlistId, albumId) => {
  logger.debug(`Deleting album ${albumId} from playlist ${playlistId}`);
  return db(tables.playlists_albums).where({
    playlist_id: playlistId,
    album_id: albumId,
  }).del();
};

const deleteAssociationsOfAlbum = albumId => {
  logger.debug(`Deleting album ${albumId} associations`);
  return db(tables.playlists_albums).where('album_id', albumId).del();
};

const deleteAssociationsOfPlaylist = playlistId => {
  logger.debug(`Deleting playlist ${playlistId} associations`);
  return db(tables.playlists_albums).where('playlist_id', playlistId).del();
};

module.exports = {
  addAlbum,
  deleteAlbum,
  deleteAssociationsOfAlbum,
  deleteAssociationsOfPlaylist,
};
