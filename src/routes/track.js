const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');
const rest = require('restler');
const logger = require('../utils/logger');
const fs = require('fs');
const ger = require('../ger/');

const trackExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    albumId: {
      required: true,
      type: 'number',
    },
    artists: {
      required: true,
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
};

const trackRatingExpectedBodySchema = {
  type: 'object',
  properties: {
    rate: {
      required: true,
      type: 'number',
      minimum: 1,
      maximum: 5,
    },
  },
};

const uploadNewTrackFile = (trackFile, track) => {
  if (trackFile) {
    rest.post('http://52.27.130.90:8080/tracks', {
      multipart: true,
      data: {
        trackname: rest.file(trackFile.path, `${trackFile.filename}.mp3`, trackFile.size, null, trackFile.mimetype),
      },
    }).on('complete', data => {
      logger.info('Uploaded file to app server');
      const updatedTrack = {
        external_id: data.trackId,
      };
      db.general.updateEntryWithId(tables.tracks, track.id, updatedTrack)
        .catch(logger.debug('Updated external id'));
      fs.unlinkSync(`${process.cwd()}/${trackFile.path}`);
    });
  }
};

/* Routes */

const getTracks = (req, res) => {
  db.track.findAllTracks(req.query)
    .then(tracks => respond.successfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const newTrack = (req, res) => {
  // Because of form data, everything comes as string
  // Convert to int so the rest of the flow and tests
  // are not affected
  req.body.albumId = parseInt(req.body.albumId, 10);
  for (let i = 0, len = req.body.artists.length; i < len; i += 1) {
    req.body.artists[i] = parseInt(req.body.artists[i], 10);
  }
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
    .then(() => {
      db.track.createNewTrackEntry(req.body)
        .then(track => {
          respond.successfulTrackCreation(track, res);
          uploadNewTrackFile(req.file, track);
        })
        .catch(error => {
          if (error.name === 'NonExistentIdError') {
            return respond.nonExistentId(error.message, res);
          }
          return respond.internalServerError(error, res);
        });
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const getTrack = (req, res) => {
  db.track.findTrackWithId(req.params.id)
    .then(track => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      return respond.successfulTrackFetch(track, res);
    });
};

const updateTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.tracks, req.params.id)
        .then(track => {
          if (!respond.entryExists(req.params.id, track, res)) return;
          db.track.updateTrackEntry(req.body, req.params.id)
            .then(track => respond.successfulTrackUpdate(track, res))
            .catch(error => {
              if (error.name === 'NonExistentIdError') {
                return respond.nonExistentId(error.message, res);
              }
              respond.internalServerError(error, res);
            });
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteTrack = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then(track => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      db.track.deleteTrackWithId(req.params.id)
        .then(() => respond.successfulTrackDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const trackLike = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then(track => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      ger.event('tracks', req.user.id, 'likes', req.params.id, '2025-06-06');
      db.track.like(req.user.id, req.params.id)
        .then(() => respond.successfulTrackLike(track, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const trackDislike = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then(track => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      ger.event('tracks', req.user.id, 'dislikes', req.params.id, '2025-06-06');
      db.track.dislike(req.user.id, req.params.id)
        .then(() => respond.successfulTrackDislike(track, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getFavoriteTracks = (req, res) => {
  db.track.findUserFavorites(req.user.id)
    .then(tracks => respond.successfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const getTrackPopularity = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then(track => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      db.track.calculateRate(req.params.id)
        .then(rating => respond.successfulTrackPopularityCalculation(rating, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const rateTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackRatingExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.tracks, req.params.id)
        .then(track => {
          if (!respond.entryExists(req.params.id, track, res)) return;
          db.track.rate(req.params.id, req.user.id, req.body.rate)
            .then(() => respond.successfulTrackRate(req.body.rate, res))
            .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const getRecommendedTracks = (req, res) => {
  ger.recommendations_for_person('tracks', req.user.id, {
    actions: { likes: 1 },
    filter_previous_actions: ['likes'],
  })
    .then(recommendations => {
      const recommendedIds = [];
      for (let i = 0, len = recommendations.recommendations.length; i < len; i += 1) {
        recommendedIds.push(recommendations.recommendations[i].thing);
      }
      db.track.findTracksWithIds(recommendedIds)
        .then(tracks => respond.successfulTracksFetch(tracks, res))
        .catch(error => respond.internalServerError(error, res));
    });
};

module.exports = {
  getTracks,
  newTrack,
  getTrack,
  updateTrack,
  deleteTrack,
  trackLike,
  trackDislike,
  getFavoriteTracks,
  getTrackPopularity,
  rateTrack,
  getRecommendedTracks,
};
