const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const artistTrackHandler = require('./artistTrackHandler');

const createNewTrackEntry = (track, artistIds) => {
  return generalHandler.createNewEntry(tables.tracks, track)
    .then((insertedTrack) => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      artistTrackHandler.insertAssociations(insertedTrack[0].id, artistIds);
      return insertedTrack;
    });
};

const updateTrackEntry = (track, artistIds) => {
  return generalHandler.updateEntry(tables.tracks, track)
    .then((insertedTrack) => {
      logger.info(`Updated track: ${JSON.stringify(insertedTrack, null, 4)}`);
      artistTrackHandler.updateAssociations(insertedTrack[0].id, artistIds);
      return insertedTrack;
    });
};

module.exports = { createNewTrackEntry, updateTrackEntry };
