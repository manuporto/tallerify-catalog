process.env.NODE_ENV = 'test';

const app = require('../../../app');
const db = require('../../../database/index');
const tables = require('../../../database/tableNames');
const dbHandler = require('../../../handlers/db/index');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../../utils/logger');

chai.should();
chai.use(chaiHttp);

const config = require('./../../../config');
const constants = require('./track.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

let initialArtistId1;
let initialArtistId2;
let initialArtistShort1;
let initialArtistShort2;
let initialAlbumId;
let initialAlbumShort;
let initialTrackId;
let testTrack;
let updatedTrack;

describe('Track', () => {
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
                logger.debug(`Tests artists created: ${JSON.stringify(artists, null, 4)}`);
                initialArtistId1 = artists[0].id;
                initialArtistId2 = artists[1].id;

                initialArtistShort1 = {
                  id: initialArtistId1,
                  name: artists[0].name,
                  href: null,
                  images: artists[0].images,
                };
                initialArtistShort2 = {
                  id: initialArtistId2,
                  name: artists[1].name,
                  href: null,
                  images: artists[1].images,
                };
                dbHandler.album.createNewAlbumEntry(constants.initialAlbum)
                .then(album => {
                  logger.debug(`Tests album created: ${JSON.stringify(album, null, 4)}`);

                  initialAlbumId = album.id;
                  initialAlbumShort = {
                    id: initialAlbumId,
                    href: null,
                    name: album.name,
                    images: album.images,
                  };
                  testTrack = Object.assign({}, constants.testTrack, {
                    albumId: initialAlbumId,
                    artists: [initialArtistId2],
                  });
                  updatedTrack = Object.assign({}, constants.updatedTrack, {
                    albumId: initialAlbumId,
                    artists: [initialArtistId1],
                  });

                  dbHandler.track.createNewTrackEntry(
                    Object.assign({}, constants.initialTrack, { albumId: initialAlbumId }))
                    .then(tracks => {
                      logger.debug(`Tests tracks created: ${JSON.stringify(tracks, null, 4)}`);
                      initialTrackId = tracks[0].id;
                      done();
                    })
                    .catch(error => {
                      logger.warn(`Test tracks creation error: ${error}`);
                      done(error);
                    });
                })
                .catch(error => {
                  logger.warn(`Test album creation error: ${error}`);
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

  describe('/GET tracks', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('tracks');
          res.body.tracks.should.be.a('array');
          res.body.tracks.should.have.lengthOf(1);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get('/api/tracks')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET tracks?name=', () => {
    it('should return status code 200 with existent track name', done => {
      request(app)
        .get(`/api/tracks?name=${constants.initialTrack.name}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 with non existent track name', done => {
      request(app)
        .get('/api/tracks?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return albums matching with the name in the query', done => {
      request(app)
        .get(`/api/tracks?name=${constants.initialTrackname}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('tracks');
          res.body.tracks.should.be.a('array');
          res.body.tracks.should.have.lengthOf(1);
          res.body.tracks.map(track => track.name.should.eql(constants.initialTrack.name));
          done();
        });
    });

    it('should return no albums if the name query doesn\'t match any album ', done => {
      request(app)
        .get('/api/tracks?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('tracks').eql([]);
          done();
        });
    });

    it('should return no albums if the name query it\'s empty', done => {
      request(app)
        .get('/api/tracks?name=')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('tracks').eql([]);
          done();
        });
    });
  });

  describe('/POST tracks', () => {
    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newTrackWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidTrack)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .send(testTrack)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .send(testTrack)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('name').eql(testTrack.name);
          res.body.should.have.property('duration');
          res.body.should.have.property('href');
          res.body.should.have.property('album').eql(initialAlbumShort);
          res.body.should.have.property('artists').eql([initialArtistShort2]);
          res.body.should.have.property('popularity');
          // TODO add check for 'rate: int' inside popularity object
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(testTrack)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET tracks/{id}', () => {
    it('should return status code 200', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return track data', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('track');
          res.body.track.should.have.property('id').eql(initialTrackId);
          res.body.track.should.have.property('name').eql(constants.initialTrack.name);
          res.body.track.should.have.property('duration');
          res.body.track.should.have.property('href');
          res.body.track.should.have.property('album').eql(initialAlbumShort);
          res.body.track.should.have.property('artists')
            .eql([
              initialArtistShort1,
              initialArtistShort2,
            ]);
          res.body.track.should.have.property('popularity');
          // TODO add check for 'rate: int' inside popularity object
          done();
        });
    });

    it('should return status code 404 if id does not match a track', done => {
      request(app)
        .get(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT tracks/{id}', () => {
    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedTrack)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedTrack)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name').eql(updatedTrack.name);
          res.body.should.have.property('duration');
          res.body.should.have.property('href');
          res.body.should.have.property('album').eql(initialAlbumShort);
          res.body.should.have.property('artists').eql([initialArtistShort1]);
          res.body.should.have.property('popularity');
          // TODO add check for 'rate: int' inside popularity object
          done();
        });
    });

    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrackWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidTrack)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 with non existent artist id', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrackWithNonExistentArtist)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Non existing artist.');
          done();
        });
    });

    it('should return status code 400 with non existent album id', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedTrackWithNonExistentAlbum)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Non existing album.');
          done();
        });
    });

    it('should return status code 404 if id does not match a track', done => {
      request(app)
        .put(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedTrack)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/tracks/${initialTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(updatedTrack)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE tracks/{id}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .delete(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match a track', done => {
      request(app)
        .delete(`/api/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/tracks/${initialTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET tracks/{id}/popularity', () => {
    it('should return status code 200', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return track popularity 0', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('popularity');
          res.body.popularity.should.have.property('rate').eql(0);
          done();
        });
    });

    it('should return track popularity non 0', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.validTrackRate)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.should.have.property('popularity');
              res.body.popularity.should.have.property('rate').eql(constants.validTrackRate.rate);
              done();
            });
        });
    });

    it('should return status code 404 if id does not match a track', done => {
      request(app)
        .get(`/api/tracks/${constants.invalidTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST tracks/{id}/popularity', () => {
    it('should return status code 201', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.validTrackRate)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return user\'s track rate', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.validTrackRate)
        .end((err, res) => {
          res.body.should.have.property('rate').eql(constants.validTrackRate.rate);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidTrackRate)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when rate is out of range', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.outOfRangeTrackRate)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match a track', done => {
      request(app)
        .post(`/api/tracks/${constants.invalidTrackId}/popularity`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.validTrackRate)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.validTrackRate)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
