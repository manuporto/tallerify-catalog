const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const createNewTrackEntry = (body) => {
  let track = {
    name: body.name,
    albumId: body.albumId,
    popularity: 0,
  };
  return generalHandler.createNewEntry(tables.tracks, track)
    .then((insertedTrack) => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      return artistTrackHandler.insertAssociations(insertedTrack[0].id, body.artists)
        .then(() => insertedTrack);
    });
};

const updateTrackEntry = (body, id) => {
  let track = {
    name: body.name,
    albumId: body.albumId,
    popularity: 0,
  };
  return generalHandler.updateEntryWithId(tables.tracks, id, track)
    .then((updatedTrack) => {
      logger.info(`Updated track: ${JSON.stringify(updatedTrack, null, 4)}`);
      return artistTrackHandler.updateAssociations(updatedTrack[0].id, body.artists)
        .then(() => updatedTrack);
    });
};

module.exports = { createNewTrackEntry, updateTrackEntry };
