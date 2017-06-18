const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const trackHandler = require('./trackHandler');
const albumArtistHandler = require('./albumArtistHandler');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const _findAllAlbums = () => db
    .select('al.*',
      db.raw('to_json(array_agg(distinct ar.*)) as artists, to_json(array_agg(distinct tr.*)) as tracks'))
    .from('albums as al')
    .leftJoin('albums_artists as aa', 'al.id', 'aa.album_id')
    .leftJoin('artists as ar', 'ar.id', 'aa.artist_id')
    .leftJoin('tracks as tr', 'tr.album_id', 'al.id')
    .groupBy('al.id');

const findAllAlbums = queries => {
  logger.info('Fetching albums');
  // Ugly hack to return empty array if empty name query it'supplied
  // The normal behavior (knex) it's to return everything
  if (queries.name === '') return Promise.resolve([]);
  return (queries.name) ? _findAllAlbums().where('al.name', queries.name) : _findAllAlbums();
};

const findAlbumWithId = id => {
  logger.info(`Fetching album with id: ${id}`);
  return _findAllAlbums()
    .where('al.id', id)
    .first();
};

const findAlbumsWithIds = ids => {
  logger.info('Fetching albums with selected ids.');
  return _findAllAlbums().whereIn('al.id', ids);
};

const checkArtistsExistence = body => db(tables.artists).whereIn('id', body.artists).then(artists => {
  if (artists.length < body.artists.length) {
    logger.warn(`Req artists: ${JSON.stringify(body.artists)} vs DB artists: ${JSON.stringify(artists)}`);
    return Promise.reject(new NonExistentIdError('Non existing artist.'));
  }
  return artists;
});

const createNewAlbumEntry = body => {
  logger.debug(`Creating album with info: ${JSON.stringify(body, null, 4)}`);
  const album = {
    name: body.name,
    release_date: body.release_date,
    genres: body.genres,
    images: body.images,
    sum_of_ratings: 0,
    amount_of_ratings: 0
  };
  return checkArtistsExistence(body)
    .then(() => generalHandler.createNewEntry(tables.albums, album)
        .then(insertedAlbum => {
          logger.debug(`Inserted album: ${JSON.stringify(insertedAlbum, null, 4)}`);
          return albumArtistHandler.insertAssociations(insertedAlbum[0].id, body.artists)
            .then(() => findAlbumWithId(insertedAlbum[0].id));
        }));
};

const updateAlbumEntry = (body, id) => {
  logger.debug(`Updating album ${id}`);
  const album = {
    name: body.name,
    release_date: body.release_date,
    genres: body.genres,
    images: body.images,
  };

  return checkArtistsExistence(body)
    .then(() => generalHandler.updateEntryWithId(tables.albums, id, album)
        .then(updatedAlbum => {
          logger.debug(`Updated album: ${JSON.stringify(updatedAlbum, null, 4)}`);
          return albumArtistHandler.updateAssociationsOfAlbum(updatedAlbum[0].id, body.artists)
            .then(() => findAlbumWithId(updatedAlbum[0].id));
        }));
};

const updateAlbumPopularityAttributes = (albumId, vote) => {
  logger.debug(`Updating album ${albumId} popularity attributes`);
  return db(tables.albums).where('id', albumId).increment('sum_of_ratings', vote).increment('amount_of_ratings', 1);
};

const deleteAlbumWithId = id => {
  logger.debug(`Deleting album ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.albums, id),
    albumArtistHandler.deleteAssociationsOfAlbum(id),
    trackHandler.removeTracksFromAlbum(id),
  ];
  return Promise.all(deleters);
};

module.exports = {
  findAllAlbums,
  findAlbumWithId,
  findAlbumsWithIds,
  createNewAlbumEntry,
  updateAlbumEntry,
  deleteAlbumWithId,
  updateAlbumPopularityAttributes,
};
