const winston = require('winston');
var models = require('../models/index');

getUsers = (req, res) => {
  winston.log('info', `GET /api/users`);
  models.User.findAll({}).then(users => {
    res.status(200).json(users);
  }).catch(reason => {
    winston.log('warn', `Error when doing GET /api/users: "${reason}"`);
    res.status(500);
  });
};

isReqBodyValid = (body) => {
  return (
    typeof body.userName !== 'undefined' &&
    typeof body.firstName !== 'undefined' &&
    typeof body.lastName !== 'undefined' &&
    typeof body.country !== 'undefined' &&
    typeof body.email !== 'undefined' &&
    typeof body.birthdate !== 'undefined' &&
    typeof body.images !== 'undefined'
  );
};

postUser = (req, res) => {
  winston.log('info', `POST /api/users with body ${JSON.stringify(req.body, null, 4)}`);
  if (!isReqBodyValid(req.body)) {
    winston.log('warn', 'Request body parameters invalid');
    res.status(400).json({
      code: 0,
      message: "string"
    });
    return;
  }

  models.User.create({
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    country: req.body.country,
    email: req.body.email,
    birthdate: req.body.birthdate,
    images: req.body.images
  }).then(user => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(user);
  }).catch(reason => {
    winston.log('warn', `Error when doing POST /api/users: "${reason}"`);
    res.status(500);
  });
};

module.exports = { getUsers, postUser };
