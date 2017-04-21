const logger = require('../../utils/logger');
const db = require('../../database/index');

const findAllEntries = (tableName) => {
  logger.debug('Getting all entries.');
  return db.select().from(tableName);
};

const findEntryWithId = (tableName, id) => {
  logger.info(`Searching for entry ${id}`);
  return db(tableName).where('id', id);
};

const findWithUsernameAndPassword = (tableName, username, password) => {
  logger.info(`Querying database for entry with username "${username}" and password "${password}"`);
  return tableName.findAll({
    where: {
      userName: username,
      password: password,
    },
  });
};

const createNewEntry = (tableName, entry) => {
  logger.info('Creating entry');
  return db(tableName).insert(entry).returning('*');
};

function updateEntry(tableName, newEntry) {
  logger.info('Updating entry');
  return db(tableName).update(newEntry).returning('*');
}

const deleteEntryWithId = (tableName, id) => {
  logger.info(`Deleting entry ${id}`);
  return db(tableName).where('id', id).del();
};

module.exports = {
  findAllEntries,
  findEntryWithId,
  findWithUsernameAndPassword,
  createNewEntry,
  updateEntry,
  deleteEntryWithId,
};
