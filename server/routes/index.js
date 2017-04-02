const winston = require('winston');
var express = require('express');
var router = express.Router();
var models = require('../models/index');
var user = require('./user');
var token = require('./token');

router.get('/', (req, res, next) => {
  winston.log('info', 'Get /');
  res.render('index', { title: 'Express' });
});

router.get('/api/users', user.getUsers);

router.post('/api/users', user.postUser);

router.post('/api/tokens', token.generateToken);

module.exports = router;
