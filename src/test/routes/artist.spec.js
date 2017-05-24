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
const constants = require('./artist.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

describe('Artist', () => {

  beforeEach((done) => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.artist.createNewArtistEntry(constants.initialArtist)
              .then((artist) => {
                logger.info(`Tests artists created: ${JSON.stringify(artist, null, 4)}`);
                dbHandler.album.createNewAlbumEntry(constants.initialAlbum)
                  .then((album) => {
                    logger.info(`Tests album created: ${JSON.stringify(album, null, 4)}`);
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

  describe('/GET artists', () => {

    it('should return status code 200', (done) => {
      request(app)
        .get('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .get('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('artists');
          res.body.artists.should.be.a('array');
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/artists')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST artists', () => {

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newArtistWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testArtist)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testArtist)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('href');
          res.body.should.have.property('name').eql(constants.testArtist.name);
          res.body.should.have.property('description').eql(constants.testArtist.description);
          res.body.should.have.property('genres').eql(constants.testArtist.genres);
          res.body.should.have.property('images').eql(constants.testArtist.images);
          res.body.should.have.property('popularity').eql(0);
          // res.body.should.have.property('albums'); TODO
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.testArtist)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET artists/{id}', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get(`/api/artists/${constants.validArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return artist data', (done) => {
      request(app)
        .get(`/api/artists/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('artist');
          res.body.artist.should.have.property('id').eql(constants.validArtistId);
          res.body.artist.should.have.property('name').eql(constants.initialArtist.name);
          res.body.artist.should.have.property('description').eql(constants.initialArtist.description);
          res.body.artists.should.have.property('href');
          // res.body.track.should.have.property('albums'); TODO
          res.body.artist.should.have.property('genres').eql(constants.initialArtist.genres);
          res.body.artist.should.have.property('images').eql(constants.initialArtist.images);
          res.body.track.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return status code 404 if id does not match an artist', (done) => {
      request(app)
        .get(`/api/artists/${constants.invalidArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get(`/api/artists/${constants.invalidTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT tracks/{id}', () => {
    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrack)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrack)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name').eql(constants.updatedTrack.name);
          res.body.should.have.property('duration');
          res.body.should.have.property('href');
          // res.body.should.have.property('album'); TODO
          // res.body.should.have.property('artists'); TODO
          res.body.should.have.property('popularity');
          // TODO add check for 'rate: int' inside popularity object
          done();
        });
    });

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .put(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrackWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .put(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidTrack)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match a track', (done) => {
      request(app)
        .put(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrack)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .put(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedTrack)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE tracks/{id}', () => {
    it('should return status code 204 when deletion is successful', (done) => {
      request(app)
        .delete(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match a track', (done) => {
      request(app)
        .delete(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .delete(`/api/tracks/${constants.validTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});