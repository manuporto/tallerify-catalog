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
const constants = require('./album.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

let initialArtistId1;
let initialArtistId2;
let initialArtistId3;
let initialAlbumId;
let initialTrackId;
let initialArtistShort1;
let initialArtistShort2;
let initialArtistShort3;
let initialTrackShort;

describe('Album', () => {
  beforeEach(done => {
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
              .then(artists => {
                logger.debug(`Tests artists created: ${JSON.stringify(artists, null, 4)}`);
                initialArtistId1 = artists[0].id;
                initialArtistId2 = artists[1].id;
                initialArtistId3 = artists[2].id;

                initialArtistShort1 = {
                  id: initialArtistId1,
                  name: constants.initialArtist1.name,
                  href: null,
                  images: null,
                };
                initialArtistShort2 = {
                  id: initialArtistId2,
                  name: constants.initialArtist2.name,
                  href: null,
                  images: null,
                };
                initialArtistShort3 = {
                  id: initialArtistId3,
                  name: constants.initialArtist3.name,
                  href: null,
                  images: null,
                };
                dbHandler.album.createNewAlbumEntry(constants.initialAlbum)
                  .then(album => {
                    logger.debug(`Tests album created: ${JSON.stringify(album, null, 4)}`);
                    initialAlbumId = album.id;
                    const initialTrack = Object.assign({},
                      constants.initialTrack, { albumId: initialAlbumId });
                    dbHandler.track.createNewTrackEntry(initialTrack)
                      .then(track => {
                        logger.debug(`Tests track created: ${JSON.stringify(track, null, 4)}`);
                        initialTrackId = track.id;

                        initialTrackShort = {
                          id: initialTrackId,
                          name: constants.initialTrack.name,
                          href: null,
                        };
                        done();
                      })
                      .catch(error => {
                        logger.warn(`Test track creation error: ${error}`);
                        done(error);
                      });
                  })
                  .catch(error => {
                    logger.warn(`Test album creation error: ${error}`);
                    done(error);
                  });
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

  describe('/GET albums', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
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

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get('/api/albums')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET albums?name=', () => {
    it('should return status code 200 with existent album name', done => {
      request(app)
        .get(`/api/albums?name=${constants.initialAlbum.name}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 with non existent album name', done => {
      request(app)
        .get('/api/albums?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return albums matching with the name in the query', done => {
      request(app)
        .get(`/api/albums?name=${constants.initialAlbum.name}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('albums');
          res.body.albums.should.be.a('array');
          res.body.albums.should.have.lengthOf(1);
          res.body.albums.map(album => album.name.should.eql(constants.initialAlbum.name));
          done();
        });
    });

    it('should return no albums if the name query doesn\'t match any album ', done => {
      request(app)
        .get('/api/albums?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('albums').eql([]);
          done();
        });
    });

    it('should return no albums if the name query it\'s empty', done => {
      request(app)
        .get('/api/albums?name=')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('albums').eql([]);
          done();
        });
    });
  });

  describe('/POST albums', () => {
    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newAlbumWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidAlbum)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 with non existent artist id', done => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newAlbumWithNonExistentArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testAlbum)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testAlbum)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('href');
          res.body.should.have.property('name').eql(constants.testAlbum.name);
          res.body.should.have.property('artists').eql([initialArtistShort3]);
          res.body.should.have.property('genres').eql(constants.testAlbum.genres);
          res.body.should.have.property('tracks').eql([]);
          res.body.should.have.property('popularity').eql(0);
          res.body.should.have.property('release_date').eql(constants.testAlbum.release_date);
          res.body.should.have.property('images').eql(constants.testAlbum.images);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
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
    it('should return status code 200', done => {
      request(app)
        .get(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return albums data', done => {
      request(app)
        .get(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('album');
          res.body.album.should.be.a('object');
          res.body.album.should.have.property('id').eql(initialAlbumId);
          res.body.album.should.have.property('name').eql(constants.initialAlbum.name);
          res.body.album.should.have.property('images').eql(constants.initialAlbum.images);
          res.body.album.should.have.property('href');
          res.body.album.should.have.property('artists').eql([
            initialArtistShort1,
            initialArtistShort2,
            initialArtistShort3]);
          res.body.album.should.have.property('tracks').eql([initialTrackShort]);
          res.body.album.should.have.property('genres').eql(constants.initialAlbum.genres);
          res.body.album.should.have.property('popularity');
          res.body.album.should.have.property('release_date').eql(constants.initialAlbum.release_date);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', done => {
      request(app)
        .get(`/api/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/albums/${initialAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT albums/{id}', () => {
    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(initialAlbumId);
          res.body.should.have.property('href');
          res.body.should.have.property('name').eql(constants.updatedAlbum.name);
          res.body.should.have.property('artists').eql([initialArtistShort2]);
          res.body.should.have.property('genres').eql(constants.updatedAlbum.genres);
          res.body.should.have.property('tracks').eql([initialTrackShort]);
          res.body.should.have.property('popularity');
          res.body.should.have.property('release_date').eql(constants.updatedAlbum.release_date);
          res.body.should.have.property('images').eql(constants.updatedAlbum.images);
          done();
        });
    });

    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbumWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidAlbum)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 with non existent artist id', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbumWithNonExistentArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', done => {
      request(app)
        .put(`/api/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE albums/{id}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', done => {
      request(app)
        .delete(`/api/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should leave its tracks orphan', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/tracks/${initialTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.track.should.have.property('album').eql({});
              done();
            });
        });
    });
  });
});
