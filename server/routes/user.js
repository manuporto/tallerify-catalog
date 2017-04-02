const winston = require('winston');
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

postUser = (req, res) => {
  winston.log('info', `POST /api/users with body ${JSON.stringify(req.body, null, 4)}`);
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
    if (reason.name === 'SequelizeValidationError') {
      winston.log('warn', 'Invalid parameters when doing POST /api/users');
      winston.log('warn', reason);
      res.status(400).json({code: 400, message: 'Incumplimiento de precondiciones (parámetros faltantes)'});
    } else {
      winston.log('warn', `Error when doing POST /api/users: "${reason}"`);
      res.status(500).json({code: 500, message: 'Unexpected error'});
    }
  });
};

module.exports = { getUsers, postUser };
