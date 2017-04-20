const db = require('../database/');
const tables = require('../database/tableNames');

function selectAllTracks() {
  return db.select().from(tables.tracks);
}

function insertTrack(track) {
  return db(tables.tracks).returning('*').insert({
    name: track.name,
    duration: track.duration
  })
}

module.exports = { selectAllTracks, insertTrack };