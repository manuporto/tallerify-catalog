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

const deleteEntryWithId = (table, id) => {
  logger.info(`Deleting entry ${id}`);
  return table.destroy({
    where: {
      id: id,
    },
  });
};

module.exports = { findAllEntries, findEntryWithId, deleteEntryWithId };
