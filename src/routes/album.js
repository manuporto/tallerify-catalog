const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const albumExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    release_date: {
      required: true,
      type: 'string',
    },
    artists: {
      required: true,
      type: 'array',
      items: {
        type: 'integer',
      },
    },
    genres: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
    images: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

/* Routes */

const getAlbums = (req, res) => {
  db.album.findAllAlbums()
    .then(albums => respond.successfulAlbumsFetch(albums, res))
    .catch(error => respond.internalServerError(error, res));
};

const getAlbum = (req, res) => {
  db.album.findAlbumWithId(req.params.id)
    .then((album) => {
      if (!respond.entryExists(req.params.id, album, res)) return;
      respond.successfulAlbumFetch(album, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

const newAlbum = (req, res) => {
  respond.validateRequestBody(req.body, albumExpectedBodySchema)
    .then(() => {
      db.album.createNewAlbumEntry(req.body)
        .then(album => respond.successfulAlbumCreation(album, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const updateAlbum = (req, res) => {
  respond.validateRequestBody(req.body, albumExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.albums, req.params.id)
        .then((album) => {
          if (!respond.entryExists(req.params.id, album, res)) return;
          db.album.updateAlbumEntry(req.body, req.params.id)
            .then(updatedAlbum => respond.successfulAlbumUpdate(updatedAlbum, res))
            .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteAlbum = (req, res) => {
  db.general.findEntryWithId(tables.albums, req.params.id)
    .then((album) => {
      if (!respond.entryExists(req.params.id, album, res)) return;
      db.album.deleteAlbumWithId(req.params.id)
        .then(() => respond.successfulAlbumDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const addTrackToAlbum = (req, res) => {

};

const deleteTrackFromAlbum = (req, res) => {
  db.general.findEntryWithId(tables.tracks, req.params.trackId)
    .then((track) => {
      if (!respond.entryExists(req.params.trackId, track, res)) return;
      if (track.albumId != req.params.albumId)
        return respond.invalidTrackDeletionFromAlbum(req.params.trackId, req.params.albumId, res);
      db.tracks.deleteAlbumId(req.params.trackId, req.params.albumId)
        .then(() => respond.successfulTrackDeletionFromAlbum(req.params.trackId, req.params.albumId, res))
        .catch(error => respond.internalServerError(error, res));
      })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = { getAlbums, getAlbum, newAlbum, updateAlbum, deleteAlbum, addTrackToAlbum, deleteTrackFromAlbum };
