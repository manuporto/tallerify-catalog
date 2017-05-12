const logger = require('../../utils/logger');
const db = require('../../database/index');

const findAllEntries = (tableName) => {
  logger.debug('Getting all entries.');
  return db.select().from(tableName);
};

const findEntryWithId = (tableName, id) => {
  logger.info(`Searching for entry ${id} in ${tableName}`);
  return db(tableName).where('id', id).first('*');
};

const findEntriesWithIds = (tableName, ids) => {
  return db(tableName).whereIn('id', ids);
}

const findWithUsernameAndPassword = (tableName, username, password) => {
  logger.info(`Querying database for entry with username "${username}" and password "${password}"`);
  return db(tableName).where({
    userName: username,
    password: password,
  });
};

const findOneWithAttributes = (tableName, attributes) => {
  return db(tableName).where(attributes).first('*');
};

const findAllWithAttributes = (tableName, attributes) => {
  logger.info(`Querying table ${tableName} for entries with attributes ${JSON.stringify(attributes, null, 4)}`);
  return db(tableName).where(attributes);
};

const createNewEntry = (tableName, entry) => {
  logger.info(`Creating entry ${JSON.stringify(entry, null, 4)} in ${tableName}'s table.`);
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
  findAllWithAttributes,
  createNewEntry,
  updateEntry,
  updateEntryWithId,
  deleteEntryWithId,
};
