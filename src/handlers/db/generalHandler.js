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

const findAttributesOfEntryWithAttributes = (tableName, attributes, returningAtrributes) => {
  return db(tableName).where(attributes).select(returningAtrributes);
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
  findWithUsernameAndPassword,
  findOneWithAttributes,
  findAllWithAttributes,
  findAttributesOfEntryWithAttributes,
  createNewEntry,
  updateEntry,
  updateEntryWithId,
  deleteEntryWithId,
};
