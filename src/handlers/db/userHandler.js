const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');

const findWithFacebookUserId = userId => {
  logger.debug(`Querying database for entry with fb userId "${userId}"`);
  return db(tables.users).where({
    facebookUserId: userId,
  }).first('*');
};

const _findAllUsers = () => db
  .select('u.*',
    db.raw('to_json(array_agg(distinct us.*)) as contacts'))
  .from(`${tables.users} as u`)
  .leftJoin(`${tables.users_users} as uu`, 'u.id', 'uu.user_id')
  .leftJoin(`${tables.users} as us`, 'us.id', 'uu.friend_id')
  .groupBy('u.id');

const findAllUsers = () => {
  logger.debug('Getting all users.');
  return _findAllUsers();
};

const findUser = id => {
  logger.debug(`Finding user with id: ${id}`);
  return _findAllUsers().where('u.id', id).first();
};

const friend = (userId, friendId) => {
  logger.debug(`User ${userId} friending user ${friendId}`);
  return db(tables.users_users).where({
    user_id: userId,
    friend_id: friendId,
  })
    .then(result => {
      if (result.length) {
        logger.debug(`User ${userId} already friended user ${friendId}`);
        return;
      }
      logger.debug('Creating user-user association');
      return generalHandler.createNewEntry(tables.users_users, {
        user_id: userId,
        friend_id: friendId,
      });
    });
};

const unfriend = (userId, friendId) => {
  logger.debug(`User ${userId} unfriending user ${friendId}`);
  return db(tables.users_users).where({
    user_id: userId,
    friend_id: friendId,
  }).del();
};

module.exports = { findWithFacebookUserId, findUser, findAllUsers, friend, unfriend };
