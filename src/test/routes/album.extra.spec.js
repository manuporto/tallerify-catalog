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
const constants = require('./album.extra.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

var validTrackId;

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
                dbHandler.album.createNewAlbumEntry(constants.initialAlbum)
                  .then(album => {
                    logger.debug(`Tests album created: ${JSON.stringify(album, null, 4)}`);
                    Promise.all([
                      dbHandler.track.createNewTrackEntry(constants.initialTrackInAlbum),
                      dbHandler.track.createNewTrackEntry(constants.initialTrack),
                    ])
                      .then(result => {
                        logger.debug(`Tests track in album created: ${JSON.stringify(result[0], null, 4)}`);
                        logger.debug(`Tests track created: ${JSON.stringify(result[1], null, 4)}`);
                        validTrackId = result[1][0].id;
                        done();
                      })
                      .catch(error => {
                        logger.debug(`Test tracks creation error: ${error}`);
                        done(error);
                      });
                  })
                  .catch(error => {
                    logger.debug(`Test album creation error: ${error}`);
                    done(error);
                  });
              })
              .catch(error => {
                logger.debug(`Test artists creation error: ${error}`);
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

  describe('/PUT api/albums/{albumId}/track/{trackId}', () => {
    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/albums/${constants.validAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should change tracks albumId', done => {
      request(app)
        .put(`/api/albums/${constants.validAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/tracks/${validTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.track.should.have.property('album');
              res.body.track.album.should.have.property('id').eql(constants.initialAlbum.id);
              res.body.track.album.should.have.property('name').eql(constants.initialAlbum.name);
              done();
            });
        });
    });

    it('should return status code 200 if track already belongs to album', done => {
      request(app)
        .put(`/api/albums/${constants.validAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .put(`/api/albums/${constants.validAlbumId}/track/${validTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .put(`/api/albums/${constants.validAlbumId}/track/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if id does not match an album', done => {
      request(app)
        .put(`/api/albums/${constants.invalidAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if albumId and trackId are invalid', done => {
      request(app)
        .put(`/api/albums/${constants.invalidAlbumId}/track/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/albums/${constants.validAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE api/albums/{albumId}/track/{trackId}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .delete(`/api/albums/${constants.validAlbumId}/track/${constants.initialTrackInAlbum.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should leave track as orphan', done => {
      request(app)
        .delete(`/api/albums/${constants.validAlbumId}/track/${constants.initialTrackInAlbum.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/tracks/${constants.initialTrackInAlbum.id}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.track.should.not.have.property('album');
              done();
            });
        });
    });

    it('should return status code 400 if trackId does not belong to album', done => {
      request(app)
        .delete(`/api/albums/${constants.validAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if albumId does not match an album', done => {
      request(app)
        .delete(`/api/albums/${constants.invalidAlbumId}/track/${constants.initialTrackInAlbum.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .delete(`/api/albums/${constants.validAlbumId}/track/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if albumId and trackId are invalid', done => {
      request(app)
        .delete(`/api/albums/${constants.invalidAlbumId}/track/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/albums/${constants.validAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
