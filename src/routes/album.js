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
        type: 'string',
      },
    },
    genres: {
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
  db.album.findAllAlbums(req.query)
    .then(albums => respond.successfulAlbumsFetch(albums, res))
    .catch(error => respond.internalServerError(error, res));
};

const getAlbum = (req, res) => {
  db.album.findAlbumWithId(req.params.id)
    .then(album => {
      if (!respond.entryExists(req.params.id, album, res)) return;
      respond.successfulAlbumFetch(album, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

const newAlbum = (req, res) => {
  if (!(req.file)) {
    req.file = { path: '' };
  }
  respond.validateRequestBody(req.body, albumExpectedBodySchema)
    .then(() => {
      db.album.createNewAlbumEntry(req.body, req.file.path !== '' ? process.env.BASE_URL + req.file.path.replace('public/', '') : '')
        .then(album => respond.successfulAlbumCreation(album, res))
        .catch(error => {
          if (error.name === 'NonExistentIdError') {
            return respond.nonExistentId(error.message, res);
          }
          respond.internalServerError(error, res);
        });
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const updateAlbum = (req, res) => {
  respond.validateRequestBody(req.body, albumExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.albums, req.params.id)
        .then(album => {
          if (!respond.entryExists(req.params.id, album, res)) return;
          db.album.updateAlbumEntry(req.body, req.params.id)
            .then(updatedAlbum => respond.successfulAlbumUpdate(updatedAlbum, res))
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

const deleteAlbum = (req, res) => {
  db.general.findEntryWithId(tables.albums, req.params.id)
    .then(album => {
      if (!respond.entryExists(req.params.id, album, res)) return;
      db.album.deleteAlbumWithId(req.params.id)
        .then(() => respond.successfulAlbumDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const addTrackToAlbum = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.tracks, req.params.trackId),
    db.general.findEntryWithId(tables.albums, req.params.albumId),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.trackId, results[0], res)) return;
      if (!respond.entryExists(req.params.albumId, results[1], res)) return;
      db.track.updateAlbumId(req.params.trackId, req.params.albumId)
        .then(() => db.album.findAlbumWithId(req.params.albumId)
          .then(album => respond.successfulTrackAdditionToAlbum(req.params.trackId, album, res)))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const deleteTrackFromAlbum = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.tracks, req.params.trackId),
    db.general.findEntryWithId(tables.albums, req.params.albumId),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.trackId, results[0], res)) return;
      if (!respond.entryExists(req.params.albumId, results[1], res)) return;
      if (results[0].album_id != req.params.albumId) { // eslint-disable-line eqeqeq
        return respond.invalidTrackDeletionFromAlbum(req.params.trackId, req.params.albumId, res);
      }
      db.track.deleteAlbumId(req.params.trackId)
        .then(() => respond.successfulTrackDeletionFromAlbum(req.params.trackId, req.params.albumId, res)) // eslint-disable-line max-len
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = {
  getAlbums,
  getAlbum,
  newAlbum,
  updateAlbum,
  deleteAlbum,
  addTrackToAlbum,
  deleteTrackFromAlbum,
};
