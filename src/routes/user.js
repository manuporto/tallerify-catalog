const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');
const constants = require('./constants.json');

const userExpectedBodySchema = {
  type: 'object',
  properties: {
    userName: {
      required: true,
      type: 'string',
    },
    password: {
      required: true,
      type: 'string',
    },
    firstName: {
      required: true,
      type: 'string',
    },
    lastName: {
      required: true,
      type: 'string',
    },
    country: {
      required: true,
      type: 'string',
    },
    email: {
      required: true,
      type: 'string',
      format: 'email',
    },
    birthdate: {
      required: true,
      type: 'string',
    },
  },
};

const updateUserExpectedBodySchema = {
  type: 'object',
  properties: {
    userName: {
      required: true,
      type: 'string',
    },
    password: {
      required: true,
      type: 'string',
    },
    firstName: {
      required: true,
      type: 'string',
    },
    lastName: {
      required: true,
      type: 'string',
    },
    country: {
      required: true,
      type: 'string',
    },
    email: {
      required: true,
      type: 'string',
      format: 'email',
    },
    birthdate: {
      required: true,
      type: 'string',
    },
    images: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

const createNewUser = (body) => {
  let user = {
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: [constants.DEFAULT_IMAGE],
  };
  return db.general.createNewEntry(tables.users, user);
};

const updateUserInfo = (body) => {
  let updatedUser = {
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: body.images,
  };
  return db.general.updateEntry(tables.users, updatedUser);
};

const _getUser = (id, response) => {
  db.general.findEntryWithId(tables.users, id)
    .then((user) => {
      if (!respond.entryExists(id, user, response)) return;
      respond.successfulUserFetch(user, response);
    })
    .catch(error => respond.internalServerError(error, response));
};

const _updateUser = (id, body, response) => {
  respond.validateRequestBody(body, updateUserExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.users, id)
        .then((user) => {
          if (!respond.entryExists(id, user, response)) return;
          updateUserInfo(body)
            .then(updatedUser => respond.successfulUserUpdate(updatedUser, response))
            .catch(error => respond.internalServerError(error, response));
        })
        .catch(error => respond.internalServerError(error, response));
    })
    .catch(error => respond.invalidRequestBodyError(error, response));
};

/* Routes */

const getUsers = (req, res) => {
  db.general.findAllEntries(tables.users)
    .then(users => respond.successfulUsersFetch(users, res))
    .catch(error => respond.internalServerError(error, res));
};

const getUser = (req, res) => {
  _getUser(req.params.id, res);
};

const newUser = (req, res) => {
  respond.validateRequestBody(req.body, userExpectedBodySchema)
    .then(() => {
      createNewUser(req.body)
        .then(user => respond.successfulUserCreation(user, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const updateUser = (req, res) => {
  _updateUser(req.params.id, req.body, res);
};

const deleteUser = (req, res) => {
  db.general.findEntryWithId(tables.users, req.params.id)
    .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      db.general.deleteEntryWithId(tables.users, req.params.id)
        .then(() => respond.successfulUserDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const meGetUser = (req, res) => {
  _getUser(req.user.id, res);
};

const meUpdateUser = (req, res) => {
  _updateUser(req.user.id, req.body, res);
};

const meGetContacts = (req, res) => {
  db.general.findEntryWithId(tables.users, req.user.id)
    .then((user) => {
      if (!respond.entryExists(req.user.id, user, res)) return;
      const contacts = Object.assign(
        {},
        {
          contacts: user.contacts,
        });
      respond.successfulUserContactsFetch(contacts, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser, meGetUser, meUpdateUser, meGetContacts };
