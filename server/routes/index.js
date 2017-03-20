const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index', { title: 'Express' });
});

router.get('/users', (req, res) => {
  winston.log('info', `Get /users`);
  models.User.findAll({}).then(users => {
      winston.log('info', `Response: ${res}`);
      return res.json(users);
    }).catch(reason => {
      winston.log('warn', `Error when doing /users query: "${reason}"`);
  });
});

router.post('/users', (req, res) => {
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
    return res.json(user);
  });
});

module.exports = router;