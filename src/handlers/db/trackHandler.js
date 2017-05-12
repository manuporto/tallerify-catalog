const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const artistHandler = require('./artistHandler');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const math = require('mathjs');

const createNewTrackEntry = (body) => {
  logger.info(`Creating track with info: ${JSON.stringify(body, null, 4)}`);
  let track = {
    name: body.name,
    albumId: body.albumId,
  };
  return db(tables.artists).whereIn('id', body.artists).then((artists) => {
    if (artists.length < body.artists.length) {
      logger.warn(`Req artists: ${JSON.stringify(body.artists)} vs DB artists: ${JSON.stringify(artists)}`);
      return Promise.reject(new Error('Non existing artists'));
    }
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
    albumId: body.albumId,
  };
  return generalHandler.updateEntryWithId(tables.tracks, id, track)
    .then((updatedTrack) => {
      logger.info(`Updated track: ${JSON.stringify(updatedTrack, null, 4)}`);
      return artistTrackHandler.updateAssociations(updatedTrack[0].id, body.artists)
        .then(() => updatedTrack);
    });
};

const like = (userId, trackId) => {
  logger.info(`User ${userId} liking track ${trackId}`);
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  })
    .then((result) => {
      if (result.length) {
        logger.info(`User ${userId} already liked track ${trackId}`);
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

module.exports = { 
  createNewTrackEntry, 
  updateTrackEntry, 
  like, 
  dislike, 
  findUserFavorites, 
  calculateRate, 
  rate
};
