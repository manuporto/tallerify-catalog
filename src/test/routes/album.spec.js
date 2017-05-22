process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../database');
const tables = require('../../database/tableNames');
const dbHandler = require('../../handlers/db');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../utils/logger');

chai.should();
chai.use(chaiHttp);

const config = require('./../../config');
const constants = require('./album.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

describe('Album', () => {
  beforeEach((done) => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.general.createNewEntry(tables.artists,
              [
                constants.initialArtist1,
                constants.initialArtist2,
                constants.initialArtist3,
              ])
              .then((artists) => {
                logger.info(`Tests artists created: ${JSON.stringify(artists, null, 4)}`);
                dbHandler.album.createNewAlbumEntry(constants.initialAlbum)
                  .then((tracks) => {
                    logger.info(`Tests album created: ${JSON.stringify(tracks, null, 4)}`);
                    done();
                  })
                  .catch((error) => {
                    logger.warn(`Test album creation error: ${error}`);
                    done(error);
                  });
              })
              .catch((error) => {
                logger.warn(`Test artists creation error: ${error}`);
                done(error);
              });
          })
          .catch(error => done(error));
      });
  });

  afterEach((done) => {
    db.migrate.rollback()
      .then(() => done());
  });

  describe('/GET albums', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('albums');
          res.body.albums.should.be.a('array');
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/albums')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST albums', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newAlbumWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidAlbum)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testAlbum)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testAlbum)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(constants.testAlbum.id);
          res.body.should.have.property('href');
          res.body.should.have.property('name').eql(constants.testAlbum.name);
          // TODO res.body.should.have.property('artists').eql(constants.testAlbum.artists);
          res.body.should.have.property('genres').eql(constants.testAlbum.genres);
          // TODO res.body.should.have.property('tracks');
          res.body.should.have.property('popularity');
          res.body.should.have.property('release_date').eql(constants.testAlbum.release_date);
          res.body.should.have.property('images').eql(constants.testAlbum.images);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .post('/api/albums')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.testAlbum)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET albums/{id}', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get(`/api/albums/${constants.validAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return albums data', (done) => {
      request(app)
        .get(`/api/albums/${constants.validAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('album');
          res.body.album.should.be.a('object');
          res.body.album.should.have.property('id').eql(constants.validAlbumId);
          res.body.album.should.have.property('name').eql(constants.initialAlbum.name);
          res.body.album.should.have.property('images').eql(constants.initialAlbum.images);
          res.body.album.should.have.property('href');
          // TODO res.body.should.have.property('artists').eql(constants.testAlbum.artists);
          // TODO res.body.should.have.property('tracks');
          res.body.album.should.have.property('genres').eql(constants.initialAlbum.genres);
          res.body.album.should.have.property('popularity');
          res.body.album.should.have.property('release_date').eql(constants.initialAlbum.release_date);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', (done) => {
      request(app)
        .get(`/api/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get(`/api/albums/${constants.validAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT albums/{id}', () => {
    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/albums/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/albums/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('userName').eql(constants.updatedUser.userName);
          res.body.should.have.property('password').eql(constants.updatedUser.password);
          res.body.should.have.property('fb');
          res.body.should.have.property('firstName').eql(constants.updatedUser.firstName);
          res.body.should.have.property('lastName').eql(constants.updatedUser.lastName);
          res.body.should.have.property('country').eql(constants.updatedUser.country);
          res.body.should.have.property('email').eql(constants.updatedUser.email);
          res.body.should.have.property('birthdate').eql(constants.updatedUser.birthdate);
          res.body.should.have.property('images').eql(constants.updatedUser.images);
          done();
        });
    });

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .put(`/api/albums/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUserWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .put(`/api/albums/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidUser)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .put(`/api/albums/${constants.invalidUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .put(`/api/albums/${constants.validUserId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE albums/{id}', () => {
    it('should return status code 204 when deletion is successful', (done) => {
      request(app)
        .delete(`/api/albums/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', (done) => {
      request(app)
        .delete(`/api/albums/${constants.invalidUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .delete(`/api/albums/${constants.validUserId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
