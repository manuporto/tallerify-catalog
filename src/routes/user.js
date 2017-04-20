const db = require('./../dbHandlers/db');
const respond = require('./response');
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

function createNewUser(body) {
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
  return db.createNewEntry('users', user);
}

function updateUserInfo(user, body) {
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
  return db.updateEntry(user, updatedUser);
}

/* Routes */

const getUsers = (req, res) => {
  db.findAllEntries('users')
    .then(users => respond.successfulUsersFetch(users, res))
    .catch(error => respond.internalServerError(error, res));
};

const getUser = (req, res) => {
  db.findEntryWithId('users', req.params.id)
    .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      respond.successfulUserFetch(user, res);
    })
    .catch(error => respond.internalServerError(error, res));
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
  respond.validateRequestBody(req.body, updateUserExpectedBodySchema)
    .then(() => {
      db.findEntryWithId('users', req.params.id)
        .then((user) => {
          if (!respond.entryExists(req.params.id, user, res)) return;
          updateUserInfo(user, req.body)
          .then(updatedUser => respond.successfulUserUpdate(updatedUser, res))
          .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteUser = (req, res) => {
  db.findEntryWithId('users', req.params.id)
    .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      db.deleteEntryWithId('users', req.params.id)
        .then(() => respond.successfulUserDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser };
