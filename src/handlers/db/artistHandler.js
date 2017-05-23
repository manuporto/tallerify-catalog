const logger = require('../../utils/logger');
const db = require('../../database/');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const albumArtistHandler = require('./albumArtistHandler');

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

const getAlbumsInfo = (artist) => {
  // TODO
  return [];
};

const updateArtistEntry = (id, body) => {
  logger.info(`Updating artist ${id} with info: ${JSON.stringify(body, null, 4)}`);
  const artist = {
    name: body.name,
    description: body.description,
    genres: body.genres,
    images: body.images,
  };
  return generalHandler.updateEntryWithId(id, artist);
};

const deleteArtist = (id) => {
  logger.info(`Deleting artist ${id}`);
  const deleters = [
    generalHandler.deleteEntryWithId(tables.artists, id),
    albumArtistHandler.deleteAssociationsOfArtist(id),
    ];
  return Promise.all(deleters);
};

module.exports = { createNewArtistEntry, getAlbumsInfo, updateArtistEntry, deleteArtist };
