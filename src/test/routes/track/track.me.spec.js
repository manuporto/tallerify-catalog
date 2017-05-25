process.env.NODE_ENV = 'test';

const logger = require('../../../utils/logger');
const app = require('../../../app');
const db = require('../../../database/index');
const tables = require('../../../database/tableNames');
const dbHandler = require('../../../handlers/db/index');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const config = require('./../../../config');
const constants = require('./track.me.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

describe('Track me', () => {
  beforeEach(done => {
    db.migrate.rollback()
    .then(() => {
      db.migrate.rollback().then(() => {
        db.migrate.latest().then(() => {
          dbHandler.general.createNewEntry(tables.artists,
            [
              constants.initialArtist1,
              constants.initialArtist2,
            ]).then(artists => {
              logger.info(`Tests artists created: ${JSON.stringify(artists, null, 4)}`);
              dbHandler.track.createNewTrackEntry(constants.initialTrack)
                .then(tracks => {
                  logger.info(`Tests tracks created: ${JSON.stringify(tracks, null, 4)}`);
                  done();
                })
                .catch(error => {
                  logger.warn(`Test tracks creation error: ${error}`);
                  done(error);
                });
            }).catch(error => {
              logger.warn(`Test artists creation error: ${error}`);
              done(error);
            });
        })
        .catch(error => done(error));
      });
    });
  });

  afterEach(done => {
    db.migrate.rollback()
    .then(() => done());
  });

  describe('/GET tracks me', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/tracks/me/favorites')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 with a track', done => {
      request(app)
        .post(`/api/tracks/${constants.validTrackId}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get('/api/tracks/me/favorites')
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get('/api/tracks/me/favorites')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('tracks');
          res.body.tracks.should.be.a('array');
          res.body.tracks.should.be.empty; // eslint-disable-line no-unused-expressions
          done();
        });
    });

    it('should return a track when correct parameters are sent', done => {
      request(app)
        .post(`/api/tracks/${constants.validTrackId}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get('/api/tracks/me/favorites')
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.should.have.property('tracks');
              res.body.tracks.should.be.a('array');
              res.body.tracks[0].name.should.eql(constants.initialTrack.name);
              done();
            });
        });
    });

    it('should return a track when correct parameters are sent', done => {
      request(app)
        .post(`/api/tracks/${constants.validTrackId}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .delete(`/api/tracks/${constants.validTrackId}/like`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              request(app)
                .get('/api/tracks/me/favorites')
                .set('Authorization', `Bearer ${testToken}`)
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.body.should.have.property('metadata');
                  res.body.metadata.should.have.property('version');
                  res.body.metadata.should.have.property('count');
                  res.body.should.have.property('tracks');
                  res.body.tracks.should.be.a('array');
                  res.body.tracks.should.be.empty; // eslint-disable-line no-unused-expressions
                  done();
                });
            });
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get('/api/tracks/me/favorites')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
