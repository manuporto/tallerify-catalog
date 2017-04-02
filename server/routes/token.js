const winston = require('winston');
const amanda = require('amanda');
var jsonSchemaValidator = amanda('json');
var models = require('../models/index');

const expectedBodySchema = {
  type: 'object',
  properties: {
    userName: {
      required: true,
      type: 'string'
    },
    password: {
      required: true,
      type: 'string'
    }
  }
};

generateToken = (req, res) => {
  winston.log('info', `POST /api/tokens`);

  winston.log('info', `Validating request "${JSON.stringify(req.body, null, 4)}"`);
  jsonSchemaValidator.validate(req.body, expectedBodySchema, (error) => {
    if (error) {
      winston.log('err', `Request body is invalid: ${error[0].message}`);
      return res.status(400).json({code: 400, message: `Invalid body: ${error[0].message}`});

    } else {
      winston.log('info', `Querying database for user with credentials "${JSON.stringify(req.body, null, 4)}"`);
      models.users.findAll({
        where: {
          userName: req.body.userName,
          password: req.body.password,
        }
      }).then(users => {

        if (users.length === 0) {
          winston.log('err', `No user with such credentials`);
          return res.status(500).json({code: 500, message: `Internal server error: No user with such credentials`});
        }
        if (users.length > 1) {
          winston.log('err', `There is more than one user with those credentials "${users}"`);
          return res.status(500).json({code: 500, message: `Internal server error: There is more than one user with those credentials`});
        }

        res.status(201).json(Object.assign(
          {},
          {
            token: users[0].id.toString(),
            user: {
              id: users[0].id,
              href: users[0].href,
              userName: users[0].userName
            }
          }));

      }).catch(reason => {
        winston.log('err', `${reason}`);
        res.status(500).json({code: 500, message: `Internal server error: ${reason}`});
      });
    }
  });
};

module.exports = { generateToken };
