process.env.NODE_ENV = 'test';

const app = require('../../../app');
const db = require('../../../database/index');
const dbHandler = require('../../../handlers/db/index');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../../utils/logger');

chai.should();
chai.use(chaiHttp);

const config = require('./../../../config');
const constants = require('./artist.me.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

describe('Artist', () => {
  beforeEach(done => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.artist.createNewArtistEntry(constants.initialArtist)
              .then(artist => {
                logger.debug(`Tests artists created: ${JSON.stringify(artist, null, 4)}`);
                done();
              })
              .catch(error => {
                logger.warn(`Test artists creation error: ${error}`);
                done(error);
              });
          })
          .catch(error => done(error));
      });
  });

  afterEach(done => {
    db.migrate.rollback()
    .then(() => done());
  });

  describe('/POST artists/me/{id}/follow', () => {
    it('should return status code 201 when artist follow is successful', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return status code 201 when artist follow is duplicated', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/artists/me/${constants.validArtistId}/follow`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .post(`/api/artists/me/${constants.invalidArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE artists/me/{id}/follow', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .delete(`/api/artists/me/${constants.validArtistId}/follow`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              done();
            });
        });
    });

    it('should return status code 204 if unfollowed artist was never followed', done => {
      request(app)
        .delete(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .delete(`/api/artists/me/${constants.invalidArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET artists me', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/artists/me/favorites')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 with an artist', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get('/api/artists/me/favorites')
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.artists.should.have.lengthOf(1);
              res.body.artists[0].name.should.eql(constants.initialArtist.name);
              res.body.artists[0].description.should.eql(constants.initialArtist.description);
              res.body.artists[0].genres.should.eql(constants.initialArtist.genres);
              res.body.artists[0].images.should.eql(constants.initialArtist.images);
              res.body.artists[0].should.have.property('albums').eql([]);
              done();
            });
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get('/api/artists/me/favorites')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          logger.warn(JSON.stringify(res.body));
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('artists').eql([]);
          done();
        });
    });

    it('should return an artist when correct parameters are sent', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get('/api/artists/me/favorites')
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.should.have.property('artists');
              res.body.artists.should.be.a('array');
              res.body.artists[0].name.should.eql(constants.initialArtist.name);
              res.body.artists[0].description.should.eql(constants.initialArtist.description);
              res.body.artists[0].genres.should.eql(constants.initialArtist.genres);
              res.body.artists[0].images.should.eql(constants.initialArtist.images);
              res.body.artists[0].should.have.property('albums').eql([]);
              done();
            });
        });
    });

    it('should return an artist when correct parameters are sent', done => {
      request(app)
        .post(`/api/artists/me/${constants.validArtistId}/follow`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .delete(`/api/artists/me/${constants.validArtistId}/follow`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              request(app)
                .get('/api/artists/me/favorites')
                .set('Authorization', `Bearer ${testToken}`)
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.body.should.have.property('metadata');
                  res.body.metadata.should.have.property('version');
                  res.body.metadata.should.have.property('count');
                  res.body.should.have.property('artists').eql([]);
                  done();
                });
            });
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get('/api/artists/me/favorites')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
