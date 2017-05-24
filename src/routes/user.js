const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

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

const createNewUser = (body, avatarPath) => {
  const user = {
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: [avatarPath],
  };
  return db.general.createNewEntry(tables.users, user);
};

const updateUserInfo = (id, body) => {
  const updatedUser = {
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: body.images,
  };
  return db.general.updateEntryWithId(tables.users, id, updatedUser);
};

const _getUser = (id, res) => {
  db.user.findUser(id)
    .then((user) => {
      if (!respond.entryExists(id, user, res)) return;
      respond.successfulUserFetch(user, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

const _updateUser = (id, body, response) => {
  respond.validateRequestBody(body, updateUserExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.users, id)
        .then((user) => {
          if (!respond.entryExists(id, user, response)) return;
          updateUserInfo(id, body)
            .then(() => {
              // Ugly hack to get user's contacts
              // No need to recheck if user exists
              db.user.findUser(id)
                .then((user) => {
                  respond.successfulUserUpdate(user, response);
                });
            })
            .catch(error => respond.internalServerError(error, response));
        })
        .catch(error => respond.internalServerError(error, response));
    })
    .catch(error => respond.invalidRequestBodyError(error, response));
};

/* Routes */

const getUsers = (req, res) => {
  db.user.findAllUsers()
    .then(users => respond.successfulUsersFetch(users, res))
    .catch(error => respond.internalServerError(error, res));
};

const getUser = (req, res) => {
  _getUser(req.params.id, res);
};

const newUser = (req, res) => {
  if (!(req.file)) {
    req.file = { path: '' };
  }
  respond.validateRequestBody(req.body, userExpectedBodySchema)
    .then(() => {
      createNewUser(req.body, process.env.BASE_URL + req.file.path.replace('public/', ''))
        .then((user) => {
          const userWithContactsField = Object.assign({}, user[0], { contacts: [null] });
          return respond.successfulUserCreation(userWithContactsField, res);
        })
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
  db.user.findUser(req.user.id)
    .then((user) => {
      if (!respond.entryExists(req.user.id, user, res)) return;
      respond.successfulUserContactsFetch(user.contacts, res);
    })
    .catch(error => respond.internalServerError(error, res));
};

const meAddContact = (req, res) => {
  db.general.findEntryWithId(tables.users, req.params.id)
    .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      db.user.friend(req.user.id, req.params.id)
        .then(() => respond.successfulContactAddition(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const meDeleteContact = (req, res) => {
  db.general.findEntryWithId(tables.users, req.params.id)
    .then((user) => {
      if (!respond.entryExists(req.params.id, user, res)) return;
      db.user.unfriend(req.user.id, req.params.id)
        .then(() => respond.successfulContactDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};


module.exports = {
  getUsers,
  getUser,
  newUser,
  updateUser,
  deleteUser,
  meGetUser,
  meUpdateUser,
  meGetContacts,
  meAddContact,
  meDeleteContact,
};
