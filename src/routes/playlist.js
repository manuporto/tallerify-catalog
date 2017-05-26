const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');
const constants = require('./constants.json');
const logger = require('../utils/logger');

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
    ownerId: {
      required: true,
      type: 'integer',
    },
    songs: {
      required: true,
      type: 'array',
      items: {
        type: 'integer',
      },
    },
  },
};

const getPlaylists = (req, res) => {
  db.general.findAllEntries(tables.playlists)
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
  db.general.findEntryWithId(tables.playlists, req.params.id)
    .then(playlist => {
      if (!respond.entryExists(req.params.id, playlist, res)) return;
      const getters = [db.playlist.getTracksInfo(playlist), db.playlist.getOwnerInfo(playlist)];
      Promise.all(getters)
        .then(results => {
          const finalPlaylist = Object.assign({}, playlist, { tracks: results[0], owner: results[1] });
          respond.successfulPlaylistFetch(finalPlaylist, res);
        })
        .catch(error => respond.internalServerError(error, res));
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

module.exports = { getPlaylists, getPlaylist, newPlaylist, updatePlaylist, deletePlaylist };
