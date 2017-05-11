const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');

const findAllUsers = () => {
  logger.debug('Getting all users.');
  return db.from(tables.users).innerJoin(tables.users_users, 'users.id', 'users_users.user_id');
};

const friend = (userId, friendId) => {
  logger.info(`User ${userId} friending user ${friendId}`);
  return db(tables.users_users).where({
    user_id: userId,
    friend_id: friendId,
  })
    .then((result) => {
      if (result.length) {
        logger.info(`User ${userId} already friended user ${friendId}`);
        return;
      }
      logger.info('Creating user-user association');
      return generalHandler.createNewEntry(tables.users_users, {
        user_id: userId,
        friend_id: friendId,
      });
    });
};

const unfriend = (userId, friendId) => {
  logger.info(`User ${userId} unfriending user ${friendId}`);
  return db(tables.users_users).where({
    user_id: userId,
    friend_id: friendId,
  }).del();
};

module.exports = { findAllUsers, friend, unfriend };
