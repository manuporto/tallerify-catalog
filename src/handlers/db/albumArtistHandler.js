const logger = require('../../utils/logger');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const tables = require('../../database/tableNames');


const insertAssociations = (albumId, artistsIds) => {
  logger.info(`Creating associations for album ${albumId} and artists ${artistsIds}`);
  let rowValues = [];
  artistsIds.forEach((id) => {
    rowValues.push({
      album_id: albumId,
      artist_id: id,
    });
  });
  return generalHandler.createNewEntry(tables.albums_artists, rowValues);
};

const deleteAssociationsOfAlbum = (albumId) => {
  logger.info(`Deleting album ${albumId} associations`);
  return db(tables.albums_artists).where('album_id', albumId).del();
};

const updateAssociationsOfAlbum = (albumId, artistsIds) => {
  return deleteAssociationsOfAlbum(albumId)
    .then(() => insertAssociations(albumId, artistsIds));
};

const deleteAssociationsOfArtist = (artistId) => {
  logger.info(`Deleting artist ${artistId} associations`);
  return db(tables.albums_artists).where('artist_id', artistId).del();
};

const findArtistsIdsFromAlbum = (albumId) => {
  return db(tables.albums_artists).where('album_id', albumId).select('artist_id');
};

module.exports = {
  insertAssociations,
  updateAssociationsOfAlbum,
  deleteAssociationsOfAlbum,
  findArtistsIdsFromAlbum,
  deleteAssociationsOfArtist,
};
