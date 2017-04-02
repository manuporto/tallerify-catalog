const winston = require('winston');
const amanda = require('amanda');
var jsonSchemaValidator = amanda('json');
var models = require('../models/index');
const constants = require('./constants.json');

getUsers = (req, res) => {
  winston.log('info', `GET /api/users`);
  models.users.findAll({}).then(users => {
    res.status(200).json({
      metadata: {
        count: users.length,
        version: constants.API_VERSION
      },
      users: users
    });
  }).catch(reason => {
    winston.log('warn', `Error when doing GET /api/users: "${reason}"`);
    res.status(500).json({code: 500, message: 'Unexpected error'});
  });
};

const newUserExpectedBodySchema = {
  type: 'object',
  properties: {
    userName: {
      required: true,
      type: 'string'
    },
    password: {
      required: true,
      type: 'string'
    },
    firstName: {
      required: true,
      type: 'string'
    },
    lastName: {
      required: true,
      type: 'string'
    },
    country: {
      required: true,
      type: 'string'
    },
    email: {
      required: true,
      type: 'string',
      format: 'email'
    },
    birthdate: {
      required: true,
      type: 'string'
    },
    images: {
      required: true,
      type: 'array',
      items: {
        type: 'string'
      }
    },
  }
};

newUser = (req, res) => {
  winston.log('info', `POST /api/users with body ${JSON.stringify(req.body, null, 4)}`);

  winston.log('info', `Validating request body "${JSON.stringify(req.body, null, 4)}"`);
  jsonSchemaValidator.validate(req.body, newUserExpectedBodySchema, error => {
    if (error) {
      winston.log('err', `Request body is invalid: ${error[0].message}`);
      return res.status(400).json({code: 400, message: `Invalid body: ${error[0].message}`});
    } else {
      models.users.create({
        userName: req.body.userName,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        country: req.body.country,
        email: req.body.email,
        birthdate: req.body.birthdate,
        images: req.body.images
      }).then(user => {
        winston.log('info', `Response: ${res}`);
        res.status(201).json(user);
      }).catch(reason => {
        winston.log('err', `Unexpected error: ${reason}`);
        res.status(500).json({code: 500, message: `Unexpected error: ${reason}`});
      });
    }
  });
};

deleteUser = (req, res) => {
  winston.log('info', `DELETE /api/users/${req.params.id}`);

  winston.log('info', `Searching for user ${req.params.id}`);
  models.users.findOne({
    where: {
      id: req.params.id
    }
  }).then(user => {

    if (!user) {
      winston.log('info', `No user with id ${req.params.id}`);
      return res.status(404).json({code: 404, message: `No user with id ${req.params.id}`});
    }

    winston.log('info', `Found, deleting user ${req.params.id}`);
    models.users.destroy({
      where: {
        id: req.params.id
      }
    }).then(user => {
      winston.log('info', `Successful user deletion`);
      res.sendStatus(204);
    }).catch(reason => {
      winston.log('err', `Unexpected error: ${reason}`);
      res.status(500).json({code: 500, message: `Unexpected error: ${reason}`});
    });

  }).catch(reason => {
    winston.log('err', `Unexpected error: ${reason}`);
    res.status(500).json({code: 500, message: `Unexpected error: ${reason}`});
  });
};

module.exports = { getUsers, newUser, deleteUser };
