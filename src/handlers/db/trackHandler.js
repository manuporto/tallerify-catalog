const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const math = require('mathjs');

const _findAllTracks = () => db
  .select('tr.*',
    db.raw('to_json(array_agg(distinct ar.*)) as artists, to_json(array_agg(distinct al.*))::json->0 as album'))
  .from(`${tables.tracks} as tr`)
  .leftJoin(`${tables.albums} as al`, 'al.id', 'tr.album_id')
  .innerJoin(`${tables.artists_tracks} as art`, 'art.track_id', 'tr.id')
  .innerJoin(`${tables.artists} as ar`, 'ar.id', 'art.artist_id')
  .groupBy('tr.id');

const findAllTracks = queries => {
  logger.info('Finding tracks');
  // Ugly hack to return empty array if empty name query it's supplied
  // The normal behavior (knex) it's to return everything
  if (queries.name === '') return Promise.resolve([]);
  return (queries.name) ? _findAllTracks().where('tr.name', queries.name) : _findAllTracks();
};

const findTrackWithId = id => {
  logger.info('Finding track by id');
  return _findAllTracks().where('tr.id', id).first();
};

const findTracksWithIds = ids => {
  logger.info('Finding tracks with selected ids');
  return _findAllTracks().whereIn('tr.id', ids);
};

const findTracksWithAlbumsIds = albumsIds => {
  logger.info('Finding tracks with albums ids');
  return _findAllTracks().whereIn('tr.album_id', albumsIds);
};

const findArtists = body => db(tables.artists).whereIn('id', body.artists).then(artists => {
  if (artists.length < body.artists.length) {
    logger.warn(`Req artists: ${JSON.stringify(body.artists)} vs DB artists: ${JSON.stringify(artists)}`);
    return Promise.reject(new NonExistentIdError('Non existing artist.'));
  }
  return artists;
});

const findAlbum = body => db(tables.albums).where('id', body.albumId).first().then(album => {
  if (!album) {
    logger.warn(`Req album: ${JSON.stringify(body.albumId)} vs DB album: ${JSON.stringify(album)}`);
    return Promise.reject(new NonExistentIdError('Non existing album.'));
  }
  return album;
});

const createNewTrackEntry = body => {
  logger.debug(`Creating track with info: ${JSON.stringify(body, null, 4)}`);
  const track = {
    name: body.name,
    album_id: body.albumId,
  };
  const finders = [findArtists(body), findAlbum(body)];
  return Promise.all(finders)
    .then(() => generalHandler.createNewEntry(tables.tracks, track)
        .then(insertedTrack => {
          logger.debug(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
          return artistTrackHandler.insertAssociations(insertedTrack[0].id, body.artists)
            .then(() => findTrackWithId(insertedTrack[0].id));
        }));
};

const updateTrackEntry = (body, id) => {
  logger.debug(`Updating track ${id}`);
  const track = {
    name: body.name,
    album_id: body.albumId,
    external_id: body.external_id
  };
  const finders = [findArtists(body), findAlbum(body)];
  return Promise.all(finders)
    .then(() => generalHandler.updateEntryWithId(tables.tracks, id, track)
      .then(updatedTrack => {
        logger.debug(`Updated track: ${JSON.stringify(updatedTrack, null, 4)}`);
        return artistTrackHandler.updateAssociations(updatedTrack[0].id, body.artists)
          .then(() => findTrackWithId(updatedTrack[0].id));
      }));
};

const like = (userId, trackId) => {
  logger.debug(`User ${userId} liking track ${trackId}`);
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  })
    .then(result => {
      if (result.length) {
        logger.warn(`User ${userId} already liked track ${trackId}`);
        return;
      }
      logger.debug('Creating user-track association');
      return generalHandler.createNewEntry(tables.users_tracks, {
        user_id: userId,
        track_id: trackId,
      });
    });
};

const dislike = (userId, trackId) => {
  logger.debug(`User ${userId} disliking track ${trackId}`);
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  }).del();
};

const findUserFavorites = userId => {
  logger.debug('Searching for track favorites');
  return db(tables.users_tracks).select('track_id').where({
    user_id: userId,
  })
    .then(tracks => {
      const trackIds = tracks.map(track => track.track_id);
      logger.debug(`Liked track ids for user ${userId}: ${JSON.stringify(trackIds, null, 4)}`);
      return _findAllTracks().whereIn('tr.id', trackIds);
    });
};

const calculateRate = trackId => {
  logger.debug(`Calculating rating for track ${trackId}`);
  return db(tables.tracks_rating).select('rating').where({
    track_id: trackId,
  })
    .then(ratings => {
      logger.debug(`Ratings for track ${trackId}: ${JSON.stringify(ratings, null, 4)}`);
      if (!ratings.length) return 0;
      return math.mean(ratings.map(rating => rating.rating));
    });
};

const rate = (trackId, userId, rating) => {
  logger.debug(`User ${userId} rating track ${trackId} with rate: ${rating}`);
  return db(tables.tracks_rating).where({
    user_id: userId,
    track_id: trackId,
  }).del()
    .then(() => generalHandler.createNewEntry(tables.tracks_rating, {
      user_id: userId,
      track_id: trackId,
      rating,
    }));
};

const updateAlbumId = (trackId, albumId) => {
  logger.debug(`Updating track ${trackId} albumId to ${albumId}`);
  return db(tables.tracks).where('id', trackId).update({ album_id: albumId });
};

const removeTracksFromAlbum = albumId => {
  logger.debug(`Removing tracks in album ${albumId}`);
  return db(tables.tracks).where('album_id', albumId).update({ album_id: -1 });
};

const deleteAlbumId = trackId => {
  logger.debug(`Leaving track ${trackId} orphan`);
  return updateAlbumId(trackId, -1);
};

module.exports = {
  findAllTracks,
  findTrackWithId,
  findTracksWithIds,
  findTracksWithAlbumsIds,
  createNewTrackEntry,
  updateTrackEntry,
  like,
  dislike,
  findUserFavorites,
  calculateRate,
  rate,
  removeTracksFromAlbum,
  updateAlbumId,
  deleteAlbumId,
};
