const logger = require('../utils/logger');
const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const trackExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    albumId: {
      required: true,
      type: 'integer',
    },
    artists: {
      required: true,
      type: 'array',
      items: {
        type: 'integer',
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

/* Routes */

const getTracks = (req, res) => {
  db.general.findAllEntries(tables.tracks)
    .then(tracks => respond.succesfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const newTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
  .then(() => {
    db.track.createNewTrackEntry(req.body)
      .then(track => respond.successfulTrackCreation(track, res))
      .catch(error => respond.internalServerError(error, res));
  })
  .catch(error => respond.invalidRequestBodyError(error, res));
};

const getTrack = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      const getArtistsInfo = () => {
        db.artistTrack.findArtistsIdsFromTrack(track.id)
          .then((artistsIds) => {
            const ids = artistsIds.map((artistId) => artistId.artist_id);
            db.general.findEntriesWithIds(tables.artists, ids)
              .then((artists) => {
                // track.artists = artists;
                return artists;
              });
          });
      };
      const getAlbumInfo = () => {
        db.general.findEntryWithId(tables.artists, track.albumId)
          .then((album) => {
            // track.album = album;
            return album;
          });
      };
      const getters = [getArtistsInfo(), getAlbumInfo()];
      Promise.all(getters)
        .then((results) => {
          logger.info(`Results: ${JSON.stringify(results, null, 4)}`);
          logger.info(`Pre fetch Track: ${JSON.stringify(track, null, 4)}`);
          respond.successfulTrackFetch(track, res);
        })
        .catch(error => respond.internalServerError(error, res));
    });
};

const updateTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.tracks, req.params.id)
        .then((track) => {
          if (!respond.entryExists(req.params.id, track, res)) return;
          db.track.updateTrackEntry(req.body, req.params.id)
            .then(updatedTrack => respond.successfulTrackUpdate(updatedTrack, res))
            .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteTrack = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      db.general.deleteEntryWithId(tables.tracks, req.params.id)
        .then(() => respond.successfulTrackDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const trackLike = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      db.track.like(req.user.id, req.params.id)
        .then(() => respond.successfulTrackLike(track, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const trackDislike = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      db.track.dislike(req.user.id, req.params.id)
        .then(() => respond.successfulTrackDislike(track, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getFavoriteTracks = (req, res) => {
  db.track.findUserFavorites(req.user.id)
    .then(tracks => respond.succesfulTracksFetch(tracks, res))
    .catch(error => respond.internalServerError(error, res));
};

const getTrackPopularity = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
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
        .then((track) => {
          if (!respond.entryExists(req.params.id, track, res)) return;
          db.track.rate(req.params.id, req.user.id, req.body.rate)
            .then(() => respond.successfulTrackRate(req.body.rate, res))
            .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};


module.exports = { getTracks, newTrack, getTrack, updateTrack, deleteTrack, trackLike, trackDislike, getFavoriteTracks, getTrackPopularity, rateTrack };
