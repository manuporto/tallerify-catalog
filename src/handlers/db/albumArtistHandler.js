const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (albumId, artistsIds) => {
  logger.debug(`Creating associations for album ${albumId} and artists ${artistsIds}`);
  const rowValues = artistsIds.map(id => ({ album_id: albumId, artist_id: id }));
  return generalHandler.createNewEntry(tables.albums_artists, rowValues);
};

const deleteAssociationsOfAlbum = albumId => {
  logger.debug(`Deleting album ${albumId} associations`);
  return db(tables.albums_artists).where('album_id', albumId).del();
};

const updateAssociationsOfAlbum = (albumId, artistsIds) => deleteAssociationsOfAlbum(albumId)
    .then(() => insertAssociations(albumId, artistsIds));

const deleteAssociationsOfArtist = artistId => {
  logger.debug(`Deleting artist ${artistId} associations`);
  return db(tables.albums_artists).where('artist_id', artistId).del();
};

const findArtistsIdsFromAlbum = albumId => db(tables.albums_artists).where('album_id', albumId).select('artist_id');

module.exports = {
  insertAssociations,
  updateAssociationsOfAlbum,
  deleteAssociationsOfAlbum,
  findArtistsIdsFromAlbum,
  deleteAssociationsOfArtist,
};
