const logger = require('../../utils/logger');
const tables = require('../../database/tableNames');
const db = require('../../database/index');
const generalHandler = require('./generalHandler');

const innerJoin = `with user_friend as (
    with friends_ids as (
    select *
      from users u
      left join "users_users" uu on u.id = uu.user_id
  )
  select fi.*,  row_to_json(u.*) as contact 
  from friends_ids fi
  left join "users" u on fi.friend_id = u.id
)
-- select * from user_friend;
select uf.id, 
  string_agg(DISTINCT uf."userName", ',') as "userName",
    string_agg(DISTINCT uf."firstName", ',') as "firstName",
    string_agg(DISTINCT uf."lastName", ',') as "lastName",
    string_agg(DISTINCT uf.password, ',') as password,
    string_agg(DISTINCT uf.country, ',') as country,
    string_agg(DISTINCT uf.email, ',') as email,
    string_agg(DISTINCT uf."birthdate", ',') as "birthdate",
    array_agg(DISTINCT uf.images) as images,
    array_agg(DISTINCT uf."facebookUserId") as "facebookUserId",
    string_agg(DISTINCT uf.href, ',') as "href",
    json_agg(uf.contact) as contacts from user_friend uf
group by uf.id;`;

const findWithFacebookUserId = userId => {
  logger.info(`Querying database for entry with fb userId "${userId}"`);
  return db(tables.users).where({
    facebookUserId: userId,
  }).first('*');
};

const findAllUsers = () => {
  logger.debug('Getting all users.');
  return db.raw(innerJoin).then(res => res.rows);
};

const findUser = id => {
  logger.info(`Finding user with id: ${id}`);
  return db.raw(`with user_friend as (
    with friends_ids as (
    select *
      from users u
      left join "users_users" uu on u.id = uu.user_id
  )
  select fi.*,  row_to_json(u.*) as contact 
  from friends_ids fi
  left join "users" u on fi.friend_id = u.id
)
select uf.id, 
  string_agg(DISTINCT uf."userName", ',') as "userName",
    string_agg(DISTINCT uf."firstName", ',') as "firstName",
    string_agg(DISTINCT uf."lastName", ',') as "lastName",
    string_agg(DISTINCT uf.password, ',') as password,
    string_agg(DISTINCT uf.country, ',') as country,
    string_agg(DISTINCT uf.email, ',') as email,
    string_agg(DISTINCT uf."birthdate", ',') as "birthdate",
    array_agg(DISTINCT uf.images) as images,
    array_agg(DISTINCT uf."facebookUserId") as "facebookUserId",
    string_agg(DISTINCT uf.href, ',') as "href",
    json_agg(uf.contact) as contacts from user_friend uf
where uf.id = ?
group by uf.id;`, [id]).then(res => {
  if (res.rows[0]) {
    const user = Object.assign({}, res.rows[0], { images: res.rows[0].images[0] });
    return user;
  }
});
};

const friend = (userId, friendId) => {
  logger.info(`User ${userId} friending user ${friendId}`);
  return db(tables.users_users).where({
    user_id: userId,
    friend_id: friendId,
  })
    .then(result => {
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

module.exports = { findWithFacebookUserId, findUser, findAllUsers, friend, unfriend };
