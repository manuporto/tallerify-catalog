const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');
const playlistTrackHandler = require('./playlistTrackHandler');
const playlistAlbumHandler = require('./playlistAlbumHandler');
const albumHandler = require('./albumHandler');
const trackHandler = require('./trackHandler');

const union = require('lodash.union');

const NonExistentIdError = require('../../errors/NonExistentIdError');

const _findAllPlaylists = () => db
  .select('pl.*',
    db.raw('to_json(array_agg(distinct tr.*)) as tracks, to_json(array_agg(distinct u.*))::json->0 as owner'))
  .from(`${tables.playlists} as pl`)
  .leftJoin(`${tables.users} as u`, 'pl.owner_id', 'u.id')
  .leftJoin(`${tables.playlists_tracks} as pltr`, 'pl.id', 'pltr.playlist_id')
  .leftJoin(`${tables.tracks} as tr`, 'tr.id', 'pltr.track_id')
  .groupBy('pl.id');

const findAllPlaylists = () => {
  logger.info('Finding all playalists');
  return _findAllPlaylists();
};

const findPlaylistWithId = id => {
  logger.info('Finding playlist with id');
  return _findAllPlaylists().where('pl.id', id).first();
};

const findPlaylistsWithIds = ids => {
  logger.info('Finding playlists with ids');
  return _findAllPlaylists().whereIn('pl.id', ids);
};

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

const getOwnerInfo = track => generalHandler.findEntryWithId(tables.users, track.owner_id)
    .then(user => {
      logger.debug(`Returning user: ${JSON.stringify(user, null, 4)}`);
      return user;
    });

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
  return Promise.all([
    db(tables.playlists_tracks).select('track_id').where({ playlist_id: playlistId }),
    db(tables.playlists_albums).select('album_id').where({ playlist_id: playlistId }),
  ])
    .then(results => {
      const trackIds = results[0].map(track => track.track_id);
      logger.debug(`Track ids for playlist ${playlistId}: ${JSON.stringify(trackIds, null, 4)}`);
      const albumIds = results[1].map(album => album.album_id);
      logger.debug(`Album ids for playlist ${playlistId}: ${JSON.stringify(albumIds, null, 4)}`);
      return Promise.all([
        trackHandler.findTracksWithIds(trackIds),
        trackHandler.findTracksWithAlbumsIds(albumIds),
      ])
        .then(results => {
          logger.debug(`Complete tracks from playlist ${playlistId}: ${JSON.stringify(union(results[0], results[1]), null, 4)}`);
          return union(results[0], results[1]);
        });
    });
};

const addTrack = (playlistId, trackId) => playlistTrackHandler.addTrack(playlistId, trackId);

const deleteTrack = (playlistId, trackId) => playlistTrackHandler.deleteTrack(playlistId, trackId);

const getAlbums = playlistId => {
  logger.debug(`Searching for playlist ${playlistId} albums`);
  return db(tables.playlists_albums).select('album_id').where({
    playlist_id: playlistId,
  })
    .then(albums => {
      const albumIds = albums.map(album => album.album_id);
      logger.debug(`Album ids for playlist ${playlistId}: ${JSON.stringify(albumIds, null, 4)}`);
      return albumHandler.findAlbumsWithIds(albumIds);
    });
};

const addAlbum = (playlistId, albumId) => playlistAlbumHandler.addAlbum(playlistId, albumId);

const deleteAlbum = (playlistId, albumId) => playlistAlbumHandler.deleteAlbum(playlistId, albumId);


module.exports = {
  findAllPlaylists,
  findPlaylistWithId,
  findPlaylistsWithIds,
  createNewPlaylistEntry,
  getTracksInfo,
  getOwnerInfo,
  updatePlaylistEntry,
  deletePlaylistWithId,
  getTracks,
  addTrack,
  deleteTrack,
  getAlbums,
  addAlbum,
  deleteAlbum,
};
