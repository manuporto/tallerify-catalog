const winston = require('winston');
const amanda = require('amanda');
var jsonSchemaValidator = amanda('json');
var models = require('../models/index');

getUsers = (req, res) => {
  winston.log('info', `GET /api/users`);
  models.users.findAll({}).then(users => {
    res.status(200).json(users);
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
  jsonSchemaValidator.validate(req.body, newUserExpectedBodySchema, (error) => {
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

module.exports = { getUsers, newUser };
