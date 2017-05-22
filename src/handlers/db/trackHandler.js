const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const math = require('mathjs');

const createNewTrackEntry = (body) => {
  logger.info(`Creating track with info: ${JSON.stringify(body, null, 4)}`);
  const track = {
    name: body.name,
    album_id: body.albumId,
  };

  const findArtists = () => {
    return db(tables.artists).whereIn('id', body.artists).then((artists) => {
      if (artists.length < body.artists.length) {
        logger.warn(`Req artists: ${JSON.stringify(body.artists)} vs DB artists: ${JSON.stringify(artists)}`);
        return Promise.reject(new NonExistentIdError('Non existing artist.'));
      }
      return artists;
    });
  };

  const findAlbum = () => -1; // TODO

  const finders = [findArtists(), findAlbum()];
  return Promise.all(finders)
    .then((results) => {
      return generalHandler.createNewEntry(tables.tracks, track)
        .then((insertedTrack) => {
          logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
          return artistTrackHandler.insertAssociations(insertedTrack[0].id, body.artists)
            .then(() => insertedTrack);
        });
    });
};

const updateTrackEntry = (body, id) => {
  logger.info(`Updating track ${id}`);
  let track = {
    name: body.name,
    album_id: body.albumId,
  };
  return generalHandler.updateEntryWithId(tables.tracks, id, track)
    .then((updatedTrack) => {
      logger.info(`Updated track: ${JSON.stringify(updatedTrack, null, 4)}`);
      return artistTrackHandler.updateAssociations(updatedTrack[0].id, body.artists)
        .then(() => updatedTrack);
    });
};

const getArtistsInfo = (track) => {
  return artistTrackHandler.findArtistsIdsFromTrack(track.id)
    .then((artistsIds) => {
      const ids = artistsIds.map((artistId) => artistId.artist_id);
      return generalHandler.findEntriesWithIds(tables.artists, ids)
       .then((artists) => {
         logger.info(`Returning artists: ${JSON.stringify(artists, null, 4)}`);
         return artists;
       });
    });
};

const getAlbumInfo = (track) => {
  if (track.album_id !== -1) {
    return generalHandler.findEntryWithId(tables.albums, track.album_id)
      .then((album) => {
        logger.info(`Returning album: ${JSON.stringify(album, null, 4)}`);
        return album;
      });
  }
};

const like = (userId, trackId) => {
  logger.info(`User ${userId} liking track ${trackId}`);
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  })
    .then((result) => {
      if (result.length) {
        logger.warn(`User ${userId} already liked track ${trackId}`);
        return;
      }
      logger.info('Creating user-track association');
      return generalHandler.createNewEntry(tables.users_tracks, {
        user_id: userId,
        track_id: trackId,
      });
    });
};

const dislike = (userId, trackId) => {
  logger.info(`User ${userId} disliking track ${trackId}`);
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  }).del();
};

const findUserFavorites = (userId) => {
  logger.info('Searching for track favorites');
  return db(tables.users_tracks).select('track_id').where({
    user_id: userId,
  })
    .then((tracks) => {
      const trackIds = tracks.map(track => track.track_id);
      logger.info(`Liked track ids for user ${userId}: ${JSON.stringify(trackIds, null, 4)}`);
      return db(tables.tracks).whereIn('id', trackIds);
    });
};

const calculateRate = (trackId) => {
  logger.info(`Calculating rating for track ${trackId}`);
  return db(tables.tracks_rating).select('rating').where({
    track_id: trackId,
  })
    .then((ratings) => {
      logger.info(`Ratings for track ${trackId}: ${JSON.stringify(ratings, null, 4)}`);
      if (!ratings.length) return 0;
      return math.mean(ratings.map(rating => rating.rating));
    });
};

const rate = (trackId, userId, rating) => {
  logger.info(`User ${userId} rating track ${trackId} with rate: ${rating}`);
  return db(tables.tracks_rating).where({
    user_id: userId,
    track_id: trackId,
  }).del()
    .then(() => generalHandler.createNewEntry(tables.tracks_rating, {
      user_id: userId,
      track_id: trackId,
      rating: rating,
    }));
};

const updateAlbumId = (trackId, albumId) => {
  return db(tables.tracks).where('id', trackId).update({ album_id: albumId });
};

const removeTracksFromAlbum = (albumId) => {
  logger.info(`Removing tracks in album ${albumId}`);
  return db(tables.tracks).where('album_id', albumId).update({ album_id: -1 });
};

const deleteAlbumId = (trackId) => {
  // Leave track orphan
  return updateAlbumId(trackId, -1);
};

module.exports = {
  createNewTrackEntry,
  updateTrackEntry,
  getArtistsInfo,
  getAlbumInfo,
  like,
  dislike, 
  findUserFavorites,
  calculateRate,
  rate,
  removeTracksFromAlbum,
  updateAlbumId,
  deleteAlbumId,
};
