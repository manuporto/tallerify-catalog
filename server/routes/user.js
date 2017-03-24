const winston = require('winston');
var models = require('../models/index');

getUsers = (req, res) => {
  winston.log('info', `Get /users`);
  models.User.findAll({}).then(users => {
    winston.log('info', `Response: ${res}`);
    res.status(200).json(users);
  }).catch(reason => {
    winston.log('warn', `Error when doing /users query: "${reason}"`);
    res.status(500);
  });
};

postUser = (req, res) => {
  winston.log('info', `Post /users with query ${JSON.stringify(req.body, null, 4)}`);
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
  });
};

module.exports = { getUsers, postUser };
