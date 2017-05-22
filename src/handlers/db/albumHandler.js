const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const trackHandler = require('./trackHandler');
const albumArtistHandler = require('./albumArtistHandler');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const findAllAlbums = () => {
  logger.info('Fetching albums');
  return generalHandler.findAllEntries(tables.albums); // TODO full query to get artists and tracks
};

const findAlbumWithId = (id) => {
  logger.info(`Fetching album with id: ${id}`);
  return generalHandler.findEntryWithId(tables.albums, id); // TODO full query to get artists and tracks
};

const checkArtistsExistence = (body) => {
  return db(tables.artists).whereIn('id', body.artists).then((artists) => {
    if (artists.length < body.artists.length) {
      logger.warn(`Req artists: ${JSON.stringify(body.artists)} vs DB artists: ${JSON.stringify(artists)}`);
      return Promise.reject(new NonExistentIdError('Non existing artist.'));
    }
    return artists;
  });
};

const createNewAlbumEntry = (body) => {
  logger.info(`Creating album with info: ${JSON.stringify(body, null, 4)}`);
  const album = {
    name: body.name,
    release_date: body.release_date,
    genres: body.genres,
    images: body.images,
    popularity: 0
  };

  const checkers = [checkArtistsExistence(body)];
  return Promise.all(checkers)
    .then((results) => {
      return generalHandler.createNewEntry(tables.albums, album)
        .then((insertedAlbum) => {
          logger.info(`Inserted album: ${JSON.stringify(insertedAlbum, null, 4)}`);
          return albumArtistHandler.insertAssociations(insertedAlbum[0].id, body.artists)
            .then(() => insertedAlbum);
        });
    });
};

const updateAlbumEntry = (body, id) => {
  logger.info(`Updating album ${id}`);
  const album = {
    name: body.name,
    release_date: body.release_date,
    genres: body.genres,
    images: body.images,
  };

  const checkers = [checkArtistsExistence(body)];
  return Promise.all(checkers)
    .then((results) => {
      return generalHandler.updateEntryWithId(tables.albums, id, album)
        .then((updatedAlbum) => {
          logger.info(`Updated album: ${JSON.stringify(updatedAlbum, null, 4)}`);
          return albumArtistHandler.updateAssociations(updatedAlbum[0].id, body.artists)
            .then(() => updatedAlbum);
        });
    });
};

const deleteAlbumWithId = (id) => {
  logger.info(`Deleting album ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.albums, id),
    albumArtistHandler.deleteAssociations(id),
    trackHandler.removeTracksFromAlbum(id),
  ];
  return Promise.all(deleters);
};

module.exports = {
  findAllAlbums,
  findAlbumWithId,
  createNewAlbumEntry,
  updateAlbumEntry,
  deleteAlbumWithId,
};
