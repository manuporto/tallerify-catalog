const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const playlistExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    description: {
      required: true,
      type: 'string',
    },
    owner: {
      required: true,
      type: 'object',
      properties: {
        id: {
          required: true,
          type: 'integer',
        },
      },
    },
    songs: {
      required: false,
      type: 'array',
      items: {
        type: 'integer',
      },
    },
  },
};

const getPlaylists = (req, res) => {
  db.playlist.findAllPlaylists()
    .then(playlists => respond.successfulPlaylistsFetch(playlists, res))
    .catch(error => respond.internalServerError(error, res));
};

const getMyPlaylists = (req, res) => {
  db.playlist.findAllMyPlaylists(req.user.id)
    .then(playlists => respond.successfulPlaylistsFetch(playlists, res))
    .catch(error => respond.internalServerError(error, res));
};

const newPlaylist = (req, res) => {
  respond.validateRequestBody(req.body, playlistExpectedBodySchema)
    .then(() => {
      db.playlist.createNewPlaylistEntry(req.body)
        .then(playlist => respond.successfulPlaylistCreation(playlist, res))
        .catch(error => {
          if (error.name === 'NonExistentIdError') {
            return respond.nonExistentId(error.message, res);
          }
          return respond.internalServerError(error, res);
        });
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const getPlaylist = (req, res) => {
  db.playlist.findPlaylistWithId(req.params.id)
    .then(playlist => {
      if (!respond.entryExists(req.params.id, playlist, res)) return;
      respond.successfulPlaylistFetch(playlist, res);
    });
};

const updatePlaylist = (req, res) => {
  respond.validateRequestBody(req.body, playlistExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.playlists, req.params.id)
        .then(playlist => {
          if (!respond.entryExists(req.params.id, playlist, res)) return;
          db.playlist.updatePlaylistEntry(req.body, req.params.id)
            .then(updatedPlaylist => respond.successfulPlaylistUpdate(updatedPlaylist, res))
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

const deletePlaylist = (req, res) => {
  db.general.findEntryWithId(tables.playlists, req.params.id)
    .then(playlist => {
      if (!respond.entryExists(req.params.id, playlist, res)) return;
      db.playlist.deletePlaylistWithId(req.params.id)
        .then(() => respond.successfulPlaylistDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getTracks = (req, res) => {
  db.general.findEntryWithId(tables.playlists, req.params.id)
    .then(playlist => {
      if (!respond.entryExists(req.params.id, playlist, res)) return;
      db.playlist.getTracks(req.params.id)
        .then(tracks => respond.successfulTracksFetch(tracks, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const addTrackToPlaylist = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.tracks, req.params.trackId),
    db.general.findEntryWithId(tables.playlists, req.params.id),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.trackId, results[0], res)) return;
      if (!respond.entryExists(req.params.id, results[1], res)) return;
      db.playlist.addTrack(req.params.id, req.params.trackId)
        .then(() => respond.successfulTrackAdditionToPlaylist(req.params.trackId, results[1], res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const deleteTrackFromPlaylist = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.tracks, req.params.trackId),
    db.general.findEntryWithId(tables.playlists, req.params.id),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.trackId, results[0], res)) return;
      if (!respond.entryExists(req.params.id, results[1], res)) return;
      db.playlist.deleteTrack(req.params.id, req.params.trackId)
        .then(() => respond.successfulTrackDeletionFromPlaylist(req.params.trackId, results[1], res)) // eslint-disable-line max-len
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getAlbums = (req, res) => {
  db.general.findEntryWithId(tables.playlists, req.params.id)
    .then(playlist => {
      if (!respond.entryExists(req.params.id, playlist, res)) return;
      db.playlist.getAlbums(req.params.id)
        .then(albums => respond.successfulAlbumsFetch(albums, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const addAlbumToPlaylist = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.albums, req.params.albumId),
    db.general.findEntryWithId(tables.playlists, req.params.id),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.albumId, results[0], res)) return;
      if (!respond.entryExists(req.params.id, results[1], res)) return;
      db.playlist.addAlbum(req.params.id, req.params.albumId)
        .then(() => respond.successfulAlbumAdditionToPlaylist(req.params.albumId, results[1], res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const deleteAlbumFromPlaylist = (req, res) => {
  const finders = [
    db.general.findEntryWithId(tables.albums, req.params.albumId),
    db.general.findEntryWithId(tables.playlists, req.params.id),
  ];
  Promise.all(finders)
    .then(results => {
      if (!respond.entryExists(req.params.albumId, results[0], res)) return;
      if (!respond.entryExists(req.params.id, results[1], res)) return;
      db.playlist.deleteAlbum(req.params.id, req.params.albumId)
        .then(() => respond.successfulAlbumDeletionFromPlaylist(req.params.albumId, results[1], res)) // eslint-disable-line max-len
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = {
  getPlaylists,
  getMyPlaylists,
  getPlaylist,
  newPlaylist,
  updatePlaylist,
  deletePlaylist,
  getTracks,
  addTrackToPlaylist,
  deleteTrackFromPlaylist,
  getAlbums,
  addAlbumToPlaylist,
  deleteAlbumFromPlaylist,
};
