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

const createNewTrack = (body) => {
  let track = {
    name: body.name,
    albumId: body.albumId,
    popularity: 0,
  };
  return db.track.createNewTrackEntry(track, body.artists);
};

const updateTrackInfo = (body) => {
  let updatedTrack = {
    name: body.name,
    albumId: body.albumId,
    popularity: 0,
  };
  return db.track.updateTrackEntry(updatedTrack, body.artists);
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
    createNewTrack(req.body)
      .then(track => respond.successfulTrackCreation(track, res))
      .catch(error => respond.internalServerError(error, res));
  })
  .catch(error => respond.invalidRequestBodyError(error, res));
};

const getTrack = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.id)
    .then((track) => {
      if (!respond.entryExists(req.params.id, track, res)) return;
      respond.successfulTrackFetch(track, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

const updateTrack = (req, res) => {
  respond.validateRequestBody(req.body, trackExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.tracks, req.params.id)
        .then((track) => {
          if (!respond.entryExists(req.params.id, track, res)) return;
          updateTrackInfo(req.body)
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

module.exports = { getTracks, newTrack, getTrack, updateTrack, deleteTrack };
