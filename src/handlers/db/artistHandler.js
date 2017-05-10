const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');

const selectAllArtistsIdsWithNames = (names) => {
  logger.info(`Searching for artist ids with names ${names}`);
  return db(tables.artists).whereIn('name', names).select('id');
}

const selectAllArtistsShortInformationWithIds = (ids) => {
	return db(tables.artists).whereIn('id', ids).select('id', 'name');
}

module.exports = { 
	selectAllArtistsIdsWithNames, 
	selectAllArtistsShortInformationWithIds
};
