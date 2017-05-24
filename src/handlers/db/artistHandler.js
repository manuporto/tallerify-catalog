const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const albumArtistHandler = require('./albumArtistHandler');

const createNewArtistEntry = (body) => {
  logger.info(`Creating artist with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
    popularity: 0,
  };
  return generalHandler.createNewEntry(tables.artists, artist);
};

const getAlbumsInfo = (artistId) => {
  return albumArtistHandler.findAlbumsOfArtist(artistId);
};

const updateArtistEntry = (body, id) => {
  logger.info(`Updating artist ${id} with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
  };
  return generalHandler.updateEntryWithId(tables.artists, id, artist);
};

const deleteArtist = (id) => {
  logger.info(`Deleting artist ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.artists, id),
    albumArtistHandler.deleteAssociationsOfArtist(id),
    ];
  return Promise.all(deleters);
};

const follow = (userId, artistId) => {
  logger.info(`User ${userId} following artist ${artistId}`);
  return db(tables.users_artists).where({
    user_id: userId,
    artist_id: artistId,
  })
    .then((result) => {
      if (result.length) {
        logger.warn(`User ${userId} already liked followed ${artistId}`);
        return;
      }
      logger.info('Creating user-artist association');
      return generalHandler.createNewEntry(tables.users_artists, {
        user_id: userId,
        artist_id: artistId,
      });
    });
};

const unfollow = (userId, artistId) => {
  logger.info(`User ${userId} disliking track ${artistId}`);
  return db(tables.users_artists).where({
    user_id: userId,
    artist_id: artistId,
  }).del();
};

const findUserFavorites = (userId) => {
  logger.info(`Searching for artist favorites of user ${userId}`);
  return db(tables.users_artists).select('artist_id').where({
    user_id: userId,
  })
    .then((artists) => {
      const artistIds = artists.map(artist => artist.artist_id);
      logger.info(`Followed artist ids for user ${userId}: ${JSON.stringify(artistIds, null, 4)}`);
      return db(tables.artists).whereIn('id', artistIds); // TODO add albums info
    });
};

const getTracks = (artistId) => {
  logger.info(`Searching for artist ${artistId} tracks`);
  return db(tables.artists_tracks).select('track_id').where({
    artist_id: artistId,
  })
    .then((tracks) => {
      const trackIds = tracks.map(track => track.track_id);
      logger.info(`Track ids for artist ${artistId}: ${JSON.stringify(trackIds, null, 4)}`);
      return db(tables.tracks).whereIn('id', trackIds); // TODO add albums & artists info
    });
};

module.exports = {
  createNewArtistEntry,
  getAlbumsInfo,
  updateArtistEntry,
  deleteArtist,
  follow,
  unfollow,
  findUserFavorites,
  getTracks,
};
