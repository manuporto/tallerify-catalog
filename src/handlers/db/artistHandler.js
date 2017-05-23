const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');

const createNewArtistEntry = (body) => {
  logger.info(`Creating artist with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
    popularity: 0,
  };
  return generalHandler.createNewEntry(tables.artists, artist);
};

module.exports = { createNewArtistEntry };
