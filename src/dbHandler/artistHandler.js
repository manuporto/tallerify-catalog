const db = require('../database/');
const tables = require('../database/tableNames');

function selectAllArtists() {
  return db.select().from(tables.artists);
}

function selectAllArtistsIdsWithNames(names) {
  return db(tables.artists).whereIn('name', names).select('id');
}

function insertArtist(artist) {
  return db(tables.artists).returning('*').insert({
    name: artist.name,
    popularity: artist.popularity
  })
}

module.exports = { selectAllArtists, selectAllArtistsIdsWithNames, insertArtist };