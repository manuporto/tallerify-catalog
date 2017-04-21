const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const generalHandler = require('./generalHandler');
const artistHandler = require('./artistHandler');
const artistTrackHandler = require('./artistTrackHandler');

function insertTrack(track) {
  return generalHandler.createNewEntry(tables.tracks, {
    name: track.name,
    duration: track.duration, //FIXME PLADPJDPOAJPFHPOWEHFPAOHEPOFHEGOPHAEPOGHAWEOPGHQEGOPHPOHEGOPHPE
  })
    .then((insertedTrack) => {
      logger.info(`Inserted track: ${JSON.stringify(insertedTrack, null, 4)}`);
      return artistHandler.selectAllArtistsIdsWithNames(track.artists)
        .then(ids => artistTrackHandler.insertAssociations(insertedTrack[0].id, ids))
        .then(() => insertedTrack);
    })
    .then(insertedTrack => insertedTrack);
}

module.exports = { insertTrack };
