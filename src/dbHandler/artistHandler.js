const db = require('../database/');
const tables = require('../database/tableNames');

function selectAllArtists() {
  return db.select().from(tables.artists);
}

function insertArtist(artist) {
  return db(tables.artists).returning('*').insert({
    name: artist.name,
    popularity: artist.popularity
  })
}

module.exports = { selectAllArtists, insertArtist };