const db = require('./db');
const common = require('./common');
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
    .then(users => common.successfulUsersFetch(users, res))
    .catch(error => common.internalServerError(error, res));
};

const getUser = (req, res) => {
  db.findEntryWithId('users', req.params.id)
    .then((user) => {
      if (!common.entryExists(req.params.id, user, res)) return;
      common.successfulUserFetch(user, res);
    })
    .catch(error => common.internalServerError(error, res));
};

const newUser = (req, res) => {
  common.validateRequestBody(req.body, userExpectedBodySchema)
    .then(() => {
      createNewUser(req.body)
        .then(user => common.successfulUserCreation(user, res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const updateUser = (req, res) => {
  common.validateRequestBody(req.body, updateUserExpectedBodySchema)
    .then(() => {
      db.findEntryWithId('users', req.params.id)
        .then((user) => {
          if (!common.entryExists(req.params.id, user, res)) return;
          updateUserInfo(user, req.body)
          .then(updatedUser => common.successfulUserUpdate(updatedUser, res))
          .catch(error => common.internalServerError(error, res));
        })
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const deleteUser = (req, res) => {
  db.findEntryWithId('users', req.params.id)
    .then((user) => {
      if (!common.entryExists(req.params.id, user, res)) return;
      db.deleteEntryWithId('users', req.params.id)
        .then(() => common.successfulUserDeletion(res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.internalServerError(error, res));
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser };
