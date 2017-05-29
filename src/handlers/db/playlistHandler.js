const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const playlistTrackHandler = require('./playlistTrackHandler');
const playlistAlbumHandler = require('./playlistAlbumHandler');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const findTracks = body => db(tables.tracks).whereIn('id', body.songs).then(tracks => {
  if (tracks.length < body.songs.length) {
    logger.warn(`Req tracks: ${JSON.stringify(body.songs)} vs DB tracks: ${JSON.stringify(tracks)}`);
    return Promise.reject(new NonExistentIdError('Non existing track.'));
  }
  return tracks;
});

const findOwner = body => db(tables.users).where('id', body.ownerId).first().then(user => {
  if (!user) {
    logger.warn(`Req user: ${JSON.stringify(body.ownerId)} vs DB album: ${JSON.stringify(user)}`);
    return Promise.reject(new NonExistentIdError('Non existing user.'));
  }
  return user;
});

const createNewPlaylistEntry = body => {
  logger.debug(`Creating playlist with info: ${JSON.stringify(body, null, 4)}`);
  const playlist = {
    name: body.name,
    description: body.description,
    owner_id: body.ownerId,
  };
  const finders = [findTracks(body), findOwner(body)];
  return Promise.all(finders)
    .then(() => generalHandler.createNewEntry(tables.playlists, playlist)
        .then(insertedPlaylist => {
          logger.debug(`Inserted playlist: ${JSON.stringify(insertedPlaylist, null, 4)}`);
          return playlistTrackHandler.insertAssociations(insertedPlaylist[0].id, body.songs)
            .then(() => insertedPlaylist);
        }));
};

const updatePlaylistEntry = (body, id) => {
  logger.debug(`Updating playlist ${id}`);
  const playlist = {
    name: body.name,
    description: body.description,
    owner_id: body.ownerId,
  };
  const finders = [findTracks(body), findOwner(body)];
  return Promise.all(finders)
    .then(() => generalHandler.updateEntryWithId(tables.playlists, id, playlist)
      .then(updatedPlaylist => {
        logger.debug(`Updated playlist: ${JSON.stringify(updatedPlaylist, null, 4)}`);
        return playlistTrackHandler.updateAssociations(updatedPlaylist[0].id, body.songs)
          .then(() => updatedPlaylist);
      }));
};

const getTracksInfo = playlist => playlistTrackHandler.findTracksIdsFromPlaylist(playlist.id)
    .then(tracksIds => {
      const ids = tracksIds.map(trackId => trackId.track_id);
      return generalHandler.findEntriesWithIds(tables.tracks, ids)
       .then(tracks => {
         logger.debug(`Returning tracks: ${JSON.stringify(tracks, null, 4)}`);
         return tracks;
       });
    });

const getOwnerInfo = track => {
  return generalHandler.findEntryWithId(tables.users, track.owner_id)
    .then(user => {
      logger.debug(`Returning user: ${JSON.stringify(user, null, 4)}`);
      return user;
    });
};

const deletePlaylistWithId = id => {
  logger.debug(`Deleting playlist ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.playlists, id),
    playlistTrackHandler.deleteAssociations(id),
  ];
  return Promise.all(deleters);
};

const getTracks = playlistId => {
  logger.debug(`Searching for playlist ${playlistId} tracks`);
  return db(tables.playlists_tracks).select('track_id').where({
    playlist_id: playlistId,
  })
    .then(tracks => {
      const trackIds = tracks.map(track => track.track_id);
      logger.debug(`Track ids for playlist ${playlistId}: ${JSON.stringify(trackIds, null, 4)}`);
      return db(tables.tracks).whereIn('id', trackIds); // TODO add albums & artists info
    });
};

const addTrack = (playlistId, trackId) => playlistTrackHandler.addTrack(playlistId, trackId);

const deleteTrack = (playlistId, trackId) => playlistTrackHandler.deleteTrack(playlistId, trackId);

const addAlbum = (playlistId, albumId) => playlistAlbumHandler.addAlbum(playlistId, albumId);

const deleteAlbum = (playlistId, albumId) => playlistAlbumHandler.deleteAlbum(playlistId, albumId);


module.exports = {
  createNewPlaylistEntry,
  getTracksInfo,
  getOwnerInfo,
  updatePlaylistEntry,
  deletePlaylistWithId,
  getTracks,
  addTrack,
  deleteTrack,
  addAlbum,
  deleteAlbum,
};
