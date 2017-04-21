const logger = require('../utils/logger');
const models = require('../models/index');
const db = require('../database/');

const tables = {
  users: models.users,
  admins: models.admins,
};

const findAllEntries = (tableName) => {
  logger.debug('Getting all entries.');
  return db.select().from(tableName);
};

const findEntryWithId = (tableName, id) => {
  logger.info(`Searching for entry ${id}`);
  return tables[tableName].find({
    where: {
      id: id,
    },
  });
};

const findWithUsernameAndPassword = (tableName, username, password) => {
  logger.info(`Querying database for entry with username "${username}" and password "${password}"`);
  return tables[tableName].findAll({
    where: {
      userName: username,
      password: password,
    },
  });
};

const createNewEntry = (tableName, entry) => {
  logger.info('Creating entry');
  return db(tableName).returning('*').insert(entry);
};

function updateEntry(entry, newEntry) {
  logger.info('Updating entry');
  return entry.updateAttributes(newEntry);
}

const deleteEntryWithId = (tableName, id) => {
  logger.info(`Deleting entry ${id}`);
  return tables[tableName].destroy({
    where: {
      id: id,
    },
  });
};

module.exports = {
  findAllEntries,
  findEntryWithId,
  findWithUsernameAndPassword,
  createNewEntry,
  updateEntry,
  deleteEntryWithId,
};
