const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');
const constants = require('./constants.json');
const logger = require('../utils/logger');

const playlistExpectedBodySchema = {
    type: 'object',
    properties: {
        // TODO: Fill me
    },
};

const updatePlaylistExpectedBodySchema = {
    type: 'object',
    properties: {
        // TODO: Fill me
    },
};

const createPlaylist = (body) => {
    let playlist = {
        // TODO: Fill me
    };
    return db.general.createNewEntry(tables.playlists, playlist);
};

const updatePlaylistInfo = (body) => {
    let updatedPlaylist = {
        // TODO: Fill me
    };
    return db.general.updateEntry(tables.playlists, updatedPlaylist);
};

const _getPlaylist = (id, response) => {
  db.general.findEntryWithId(table.playlists, id)
      .then((playlist) => {
      if (!respond.entryExists(id, playlist, response)) return;
      respond.successfulPlaylistFetch(playlist, response);
      })
      .catch(error => respond.internalServerError(error, response));
};

const _updatePlaylist = (id, body, response) => {
    respond.validateRequestBody(body, updatePlaylistExpectedBodySchema)
        .then(() => {
            db.general.findEntryWithId(tables.playlists, id)
                .then((playlist) => {
                    if (!respond.entryExists(id, playlist, response)) return;
                    updatePlaylistInfo(body)
                        .then(updatedPlaylist => respond.successfulPlaylistUpdate(updatedPlaylist, response))
                        .catch(error => respond.internalServerError(error, response));
                })
                .catch(error => respond.internalServerError(error, response));
        })
        .catch(error => respond.invalidRequestBodyError(error, response));
};

/* Routes */

const getPlaylists = (req, res) => {
    db.general.findAllEntries(tables.playlists).
        then(playlists => respond.succesfulPlaylistsFetch(playlists, res))
        .catch(error => respond.internalServerError(error, res))
};

const getPlaylist = (req, res) => {
  _getPlaylist(req.params.id, res);
};

const newPlaylist = (req, res) => {
  respond.validateRequestBody(req.body, playlistExpectedBodySchema)
      .then(() => {
      createPlaylist(req.body)
          .then(playlist => respond.succesfulPlaylistCreation(playlist, res))
          .catch(error => respond.internalServerError(error, res));
      })
      .catch(error => respond.invalidRequestBodyError(error, res));
};

const updatePlaylist = (req, res) => {
    _updatePlaylist(req.params.id, req.body, res);
};

const deletePlaylist = (req, res) => {
  db.general.findEntryWithId(tables.playlists, req.params.id)
      .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      db.general.deleteEntryWithId(tables.playlists, req.params.id)
          .then(() => respond.successfulPlaylistDeletion(res))
          .catch(error => respond.internalServerError(error, res));
    })
      .catch(error => respond.internalServerError(error, res));
};

module.exports = { getPlaylists, getPlaylist, newPlaylist, updatePlaylist, deletePlaylist };
