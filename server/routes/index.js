var express = require('express');
var router = express.Router();
var models = require('../models/index');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/users', (req, res) => {
  models.User.findAll({}).then(users => {
    res.json(users);
  });
});

router.post('/users', (req, res) => {
  models.User.create({
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    country: req.body.country,
    email: req.body.email,
    birthdate: req.body.birthdate,
    images: req.body.images
  }).then(user => {
    res.json(user);
  });
});

module.exports = router;
