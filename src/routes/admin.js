const constants = require('./constants.json');
const db = require('./db');
const common = require('./common');

const adminExpectedBodySchema = {
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
    email: {
      required: true,
      type: 'string',
      format: 'email',
    },
  },
};

function createNewAdmin(body) {
  let admin = {
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
  };
  return db.createNewEntry('admins', admin);
}

/* Routes */

const getAdmins = (req, res) => {
  db.findAllEntries('admins')
    .then(admins => common.successfulAdminsFetch(admins, res))
    .catch(error => common.internalServerError(error, res));
};


const newAdmin = (req, res) => {
  common.validateRequestBody(req.body, adminExpectedBodySchema)
    .then(() => {
      createNewAdmin(req.body)
        .then(admin => common.successfulAdminCreation(admin, res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const deleteAdmin = (req, res) => {
  db.findEntryWithId('admins', req.params.id)
    .then((admin) => {
      if (!common.entryExists(req.params.id, admin, res)) return;
      db.deleteEntryWithId('admins', req.params.id)
        .then(() => common.successfulAdminDeletion(res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.internalServerError(error, res));
};

module.exports = { getAdmins, newAdmin, deleteAdmin };
