const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');

function selectAllArtistsIdsWithNames(names) {
  logger.info(`Searching for artist ids with names ${names}`);
  return db(tables.artists).whereIn('name', names).select('id');
}

module.exports = { selectAllArtistsIdsWithNames };
