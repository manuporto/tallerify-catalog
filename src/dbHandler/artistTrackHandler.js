const db = require('../database/');
const tables = require('../database/tableNames');

function insertAssociations(trackId, artistsIds) {
  let rowValues = [];
  // ex artistsIds = {"id": 1, "id": 6}
  artistsIds.forEach(id => {
    rowValues.push(
    {
      track_id: trackId,
      artist_id: id.id
    }
    );
  });
  return db(tables.artists_tracks).insert(rowValues);
}

module.exports = { insertAssociations };