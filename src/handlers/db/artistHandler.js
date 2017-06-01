const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const albumArtistHandler = require('./albumArtistHandler');
const trackHandler = require('./trackHandler');

const _findAllArtists = () => db
  .select('ar.*',
    db.raw('to_json(array_agg(distinct al.*)) as albums'))
  .from(`${tables.artists} as ar`)
  .leftJoin(`${tables.albums_artists} as aa`, 'ar.id', 'aa.artist_id')
  .leftJoin(`${tables.albums} as al`, 'al.id', 'aa.album_id')
  .groupBy('ar.id');

const findAllArtists = queries => {
  logger.info('Finding artists');
  // Ugly hack to return empty array if empty name query it's supplied
  // The normal behavior (knex) it's to return everything
  if (queries.name === '') return Promise.resolve([]);
  return (queries.name) ? _findAllArtists().where('ar.name', queries.name) : _findAllArtists();
};

const findArtistWithId = id => {
  logger.info('Finding artist by id');
  return _findAllArtists().where('ar.id', id).first();
};

const createNewArtistEntry = body => {
  logger.debug(`Creating artist with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
    popularity: 0,
  };
  return generalHandler.createNewEntry(tables.artists, artist)
    .then(artist => findArtistWithId(artist[0].id));
};

const updateArtistEntry = (body, id) => {
  logger.debug(`Updating artist ${id} with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
  };
  return generalHandler.updateEntryWithId(tables.artists, id, artist)
    .then(updatedArtist => findArtistWithId(updatedArtist[0].id));
};

const deleteArtist = id => {
  logger.debug(`Deleting artist ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.artists, id),
    albumArtistHandler.deleteAssociationsOfArtist(id),
  ];
  return Promise.all(deleters);
};

const follow = (userId, artistId) => {
  logger.debug(`User ${userId} following artist ${artistId}`);
  return db(tables.users_artists).where({
    user_id: userId,
    artist_id: artistId,
  })
    .then(result => {
      if (result.length) {
        logger.warn(`User ${userId} already liked followed ${artistId}`);
        return;
      }
      logger.debug('Creating user-artist association');
      return generalHandler.createNewEntry(tables.users_artists, {
        user_id: userId,
        artist_id: artistId,
      });
    });
};

const unfollow = (userId, artistId) => {
  logger.debug(`User ${userId} disliking track ${artistId}`);
  return db(tables.users_artists).where({
    user_id: userId,
    artist_id: artistId,
  }).del();
};

const findUserFavorites = userId => {
  logger.debug(`Searching for artist favorites of user ${userId}`);
  return db(tables.users_artists).select('artist_id').where({
    user_id: userId,
  })
    .then(artists => {
      const artistIds = artists.map(artist => artist.artist_id);
      logger.debug(`Followed artist ids for user ${userId}: ${JSON.stringify(artistIds, null, 4)}`);
      return _findAllArtists().whereIn('ar.id', artistIds); // TODO add albums info
    });
};

const getTracks = artistId => {
  logger.debug(`Searching for artist ${artistId} tracks`);
  return db(tables.artists_tracks).select('track_id').where({
    artist_id: artistId,
  })
    .then(tracks => {
      const trackIds = tracks.map(track => track.track_id);
      logger.debug(`Track ids for artist ${artistId}: ${JSON.stringify(trackIds, null, 4)}`);
      return trackHandler.findAllTracks({}).whereIn('tr.id', trackIds);
    });
};

module.exports = {
  findAllArtists,
  findArtistWithId,
  createNewArtistEntry,
  updateArtistEntry,
  deleteArtist,
  follow,
  unfollow,
  findUserFavorites,
  getTracks,
};
