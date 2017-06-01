const logger = require('../../utils/logger');
const db = require('../../database/index');

const findAllEntries = tableName => {
  logger.debug('Getting all entries.');
  return db.select().from(tableName);
};

const findEntryWithId = (tableName, id) => {
  logger.debug(`Searching for entry ${id} in ${tableName}`);
  return db(tableName).where('id', id).first('*');
};

const findEntriesWithIds = (tableName, ids) => db(tableName).whereIn('id', ids);

const findWithUsernameAndPassword = (tableName, username, password) => {
  logger.debug(`Querying table ${tableName} for entry with username "${username}" and password "${password}"`);
  return db(tableName).where({
    userName: username,
    password,
  }).first('*');
};

const createNewEntry = (tableName, entry) => {
  logger.debug(`Creating entry ${JSON.stringify(entry, null, 4)} in ${tableName}'s table.`);
  return db(tableName).insert(entry).returning('*');
};

const updateEntryWithId = (tableName, id, newEntry) => {
  logger.debug('Updating entry');
  return db(tableName).update(newEntry).where('id', id).returning('*');
};

const deleteEntryWithId = (tableName, id) => {
  logger.debug(`Deleting entry ${id}`);
  return db(tableName).where('id', id).del();
};

module.exports = {
  findAllEntries,
  findEntryWithId,
  findEntriesWithIds,
  findWithUsernameAndPassword,
  createNewEntry,
  updateEntryWithId,
  deleteEntryWithId,
};
