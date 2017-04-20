const logger = require('../utils/logger');

const findAllEntries = (table) => {
  logger.debug('Getting all entries.');
  return table.findAll({});
};

const findEntryWithId = (table, id) => {
  logger.info(`Searching for entry ${id}`);
  return table.find({
    where: {
      id: id,
    },
  });
};

const createNewEntry = (table, entry) => {
  logger.info('Creating entry');
  return table.create(entry);
};

function updateEntry(entry, newEntry) {
  logger.info('Updating entry');
  return entry.updateAttributes(newEntry);
}

const deleteEntryWithId = (table, id) => {
  logger.info(`Deleting entry ${id}`);
  return table.destroy({
    where: {
      id: id,
    },
  });
};

module.exports = { findAllEntries, findEntryWithId, createNewEntry, updateEntry, deleteEntryWithId };
