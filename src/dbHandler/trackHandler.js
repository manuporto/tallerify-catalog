const Promise = require('bluebird');
const logger = require('../utils/logger');
const db = require('../database/');
const tables = require('../database/tableNames');
const artistHandler = require('./artistHandler');
const artistTrackHandler = require('./artistTrackHandler');

function selectAllTracks() {
  return db.select().from(tables.tracks);
}

function insertTrack(track) {
  return db(tables.tracks)
    .returning('*')
    .insert({
      name: track.name,
      duration: track.duration
    })
    .then(insertedTrack => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      return artistHandler.selectAllArtistsIdsWithNames(track.artists)
      .then(ids => artistTrackHandler.insertAssociations(insertedTrack[0].id, ids))
      .then(() => insertedTrack);
    })
    .then(insertedTrack => insertedTrack);
}

module.exports = { selectAllTracks, insertTrack };