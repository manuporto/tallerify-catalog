const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const artistsHandler = require('./artistHandler');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const math = require('mathjs');

const createNewTrackEntry = (body) => {
  let track = {
    name: body.name,
    albumId: body.albumId,
  };
  return generalHandler.createNewEntry(tables.tracks, track)
    .then((insertedTrack) => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      return artistTrackHandler.insertAssociations(insertedTrack[0].id, body.artists)
        .then(() => insertedTrack);
    });
};

const updateTrackEntry = (body, id) => {
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
  return generalHandler.createNewEntry(tables.users_tracks, {
    user_id: userId,
    track_id: trackId,
  });
};

const dislike = (userId, trackId) => {
  return db(tables.users_tracks).where({
    user_id: userId,
    track_id: trackId,
  }).del();
};

const findUserFavorites = (userId) => {
  return db(tables.users_tracks).select('track_id').where({
    user_id: userId,
  })
    .then((tracks) => {
      db(tables.users_tracks).where({
        id: tracks.map(track => track.track_id), // FIXME check if it works with arrays ¿?¿?¿
      });
    });
};

const calculateRate = (trackId) => {
  return db(tables.tracks_rating).select('rating').where({
    track_id: trackId,
  })
    .then((ratings) => {
      logger.info(`Ratings for track ${trackId}: ${JSON.stringify(ratings, null, 4)}`);
      if (!ratings.length) return 0;
      return math.mean(ratings.map((rating) => rating.rating));
    });
};

const rate = (trackId, userId, rating) => {
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

const getTrackInfo = (trackId) => {
  generalHandler.findEntryWithId(tables.tracks, trackId)
    .then((track) => {
      generalHandler.findAllWithAttributes(tables.artists_tracks, {track_id: track.id})
        .then((artistsIds) => {
          artistHandler.selectAllArtistsShortInformationWithIds(artistsIds)
            .then((artists) => {
              track.artists = artists;
            });
        });
    });
}
module.exports = { createNewTrackEntry, updateTrackEntry, like, dislike, findUserFavorites, calculateRate, rate };
