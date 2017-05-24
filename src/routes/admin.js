const db = require('./../handlers/db/generalHandler');
const respond = require('./../handlers/response');

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
  const admin = {
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
    .then(admins => respond.successfulAdminsFetch(admins, res))
    .catch(error => respond.internalServerError(error, res));
};


const newAdmin = (req, res) => {
  respond.validateRequestBody(req.body, adminExpectedBodySchema)
    .then(() => {
      createNewAdmin(req.body)
        .then(admin => respond.successfulAdminCreation(admin, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteAdmin = (req, res) => {
  db.findEntryWithId('admins', req.params.id)
    .then(admin => {
      if (!respond.entryExists(req.params.id, admin, res)) return;
      db.deleteEntryWithId('admins', req.params.id)
        .then(() => respond.successfulAdminDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

module.exports = { getAdmins, newAdmin, deleteAdmin };
