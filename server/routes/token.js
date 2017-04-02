const winston = require('winston');
const validator = require('tv4');
var models = require('../models/index');

const expectedBodySchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "definitions": {},
  "id": "http://example.com/example.json",
  "properties": {
  "password": {
    "id": "/properties/password",
      "type": "string"
  },
  "userName": {
    "id": "/properties/userName",
      "type": "string"
  }
},
  "required": [
  "userName",
  "password"
],
  "type": "object"
};

generateToken = (req, res) => {
  winston.log('info', `GET /api/tokens`);

  winston.log('info', `Validating request body`);
  if (!validator.validate(expectedBodySchema, req.body)) {
    winston.log('err', `Request body is invalid`);
    return res.status(400).json({code: 400, message: `Invalid body: ${validator.error.message}`});
  }

  winston.log('info', `Querying users`);
  models.User.findAll({
    where: {
      userName: req.body.userName,
      password: req.body.password,
    }
  }).then(users => {

    if (users.length > 1) {
      winston.log('err', `There is more than one user with that userName and password "${users}"`);
      return res.status(500).json({code: 500, message: `Internal server error: There is more than one user with that userName and password`});
    }

    var user = users[0];

    res.status(201).json(Object.assign(
      {},
      {
        token: user.id.toString(),
        user: {
          id: user.id,
          href: user.href,
          userName: user.userName
        }
      }));

  }).catch(reason => {
    winston.log('err', `Error when doing GET /api/tokens: "${reason}"`);
    res.status(500).json({code: 500, message: `Internal server error: ${reason}`});
  });
};

module.exports = { generateToken };
