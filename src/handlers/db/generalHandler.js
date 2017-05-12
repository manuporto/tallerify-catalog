const logger = require('../../utils/logger');
const db = require('../../database/index');

const findAllEntries = (tableName) => {
  logger.debug('Getting all entries.');
  return db.select().from(tableName);
};

const findEntryWithId = (tableName, id) => {
  logger.info(`Searching for entry ${id}`);
  return db(tableName).where('id', id).first('*');
};

const findEntriesWithIds = (tableName, ids) => {
  return db(tableName).whereIn('id', ids);
};

const findWithUsernameAndPassword = (tableName, username, password) => {
  logger.info(`Querying database for entry with username "${username}" and password "${password}"`);
  return db(tableName).where({
    userName: username,
    password: password,
  }).first('*');
};

const findOneWithAttributes = (tableName, attributes) => {
  return db(tableName).where(attributes).first('*');
};

const createNewEntry = (tableName, entry) => {
  logger.info('Creating entry');
  return db(tableName).insert(entry).returning('*');
};

const updateEntry = (tableName, newEntry) => {
  logger.info('Updating entry');
  return db(tableName).update(newEntry).returning('*');
};

const updateEntryWithId = (tableName, id, newEntry) => {
  logger.info('Updating entry');
  return db(tableName).update(newEntry).where('id', id).returning('*');
};

const deleteEntryWithId = (tableName, id) => {
  logger.info(`Deleting entry ${id}`);
  return db(tableName).where('id', id).del();
};

module.exports = {
  findAllEntries,
  findEntryWithId,
  findEntriesWithIds,
  findWithUsernameAndPassword,
  findOneWithAttributes,
  createNewEntry,
  updateEntry,
  updateEntryWithId,
  deleteEntryWithId,
};
