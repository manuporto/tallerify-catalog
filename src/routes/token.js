const winston = require('winston');
const amanda = require('amanda');
const models = require('../models/index');

const jsonSchemaValidator = amanda('json');

const expectedBodySchema = {
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
  },
};

const generateToken = (req, res) => {
  winston.log('info', 'POST /api/tokens');

  winston.log('info', `Validating request "${JSON.stringify(req.body, null, 4)}"`);
  return jsonSchemaValidator.validate(req.body, expectedBodySchema, (error) => {
    if (error) {
      winston.log('warn', `Request body is invalid: ${error[0].message}`);
      return res.status(400).json({ code: 400, message: `Invalid body: ${error[0].message}` });
    }
    winston.log('info', `Querying database for user with credentials "${JSON.stringify(req.body, null, 4)}"`);
    return models.users.findAll({
      where: {
        userName: req.body.userName,
        password: req.body.password,
      },
    }).then((users) => {
      if (users.length === 0) {
        winston.log('warn', 'No user with such credentials');
        return res.status(500).json({ code: 500, message: 'No user with such credentials' });
      }
      if (users.length > 1) {
        winston.log('warn', `There is more than one user with those credentials "${users}"`);
        return res.status(500).json({ code: 500, message: 'There is more than one user with those credentials' });
      }

      const response = Object.assign(
          {},
        {
          token: users[0].id.toString(),
          user: {
            id: users[0].id,
            href: users[0].href,
            userName: users[0].userName,
          },
        });

      winston.log('info', `Response: ${response}`);
      return res.status(201).json(response);
    }).catch((reason) => {
      winston.log('warn', `Unexpected error: ${reason}`);
      return res.status(500).json({ code: 500, message: `Unexpected error: ${reason}` });
    });
  });
};

const generateAdminToken = (req, res) => {
  winston.log('info', 'POST /api/tokens/admins');

  winston.log('info', `Validating request "${JSON.stringify(req.body, null, 4)}"`);
  return jsonSchemaValidator.validate(req.body, expectedBodySchema, (error) => {
    if (error) {
      winston.log('warn', `Request body is invalid: ${error[0].message}`);
      return res.status(400).json({ code: 400, message: `Invalid body: ${error[0].message}` });
    }
    winston.log('info', `Querying database for admin with credentials "${JSON.stringify(req.body, null, 4)}"`);
    return models.admins.findAll({
      where: {
        userName: req.body.userName,
        password: req.body.password,
      },
    }).then((admins) => {
      if (admins.length === 0) {
        winston.log('warn', 'No admin with such credentials');
        return res.status(500).json({ code: 500, message: 'No admin with such credentials' });
      }
      if (admins.length > 1) {
        winston.log('warn', `There is more than one admin with those credentials "${admins}"`);
        return res.status(500).json({ code: 500, message: 'There is more than one admin with those credentials' });
      }

      const response = Object.assign(
        {},
        {
          token: admins[0].id.toString(),
          admin: {
            id: admins[0].id,
            userName: admins[0].userName,
          },
        });

      winston.log('info', `Response: ${response}`);
      return res.status(201).json(response);
    }).catch((reason) => {
      winston.log('warn', `Unexpected error: ${reason}`);
      return res.status(500).json({ code: 500, message: `Unexpected error: ${reason}` });
    });
  });
};

module.exports = { generateToken, generateAdminToken };
