const logger = require('../utils/logger');
const express = require('express');
const user = require('./user');
const token = require('./token');
const artist = require('./artist');
const track = require('./track');
const admin = require('./admin');
const passport = require('../handlers/auth/jwt');


const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/secret', (req, res, next) => {
  logger.info('===== Check');
  passport.authenticate('jwt', (err, user, info) => {
    logger.info(`Err: ${JSON.stringify(err, null, 4)}`);
    logger.info(`User: ${JSON.stringify(user, null, 4)}`);
    logger.info(`Info: ${JSON.stringify(info, null, 4)}`);
    if (err || info) {
      res.status(400).json({ message: 'Invalid credentials' });
      next(new Error('Unauthorized. !!! uno mil 1'));
    } else {
      res.json({ message: "Success! You can not see this without a token" });
    }
  })(req, res, next);
});

/* Users */

router.get('/api/users/me', passport.authenticate('jwt'), user.meGetUser);

router.put('/api/users/me', passport.authenticate('jwt'), user.meUpdateUser);

router.get('/api/users/me/contacts', passport.authenticate('jwt'), user.meGetContacts);

router.get('/api/users', user.getUsers);

router.get('/api/users/:id', user.getUser);

router.post('/api/users', user.newUser);

router.put('/api/users/:id', user.updateUser);

router.delete('/api/users/:id', user.deleteUser);

/* Admins */

router.get('/api/admins', admin.getAdmins);

router.post('/api/admins', admin.newAdmin);

router.delete('/api/admins/:id', admin.deleteAdmin);

/* Tokens */

router.post('/api/tokens', token.generateToken);

router.post('/api/admins/tokens', token.generateAdminToken);

/* Artists */

router.get('/api/artists', artist.getArtists);

router.post('/api/artists', artist.newArtist);

/* Tracks */

router.get('/api/tracks', track.getTracks);

router.post('/api/tracks', track.newTrack);

module.exports = router;
