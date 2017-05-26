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
const constants = require('./album.extra.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

let initialAlbumId;
let additionalAlbumId;
let trackInAlbumId;
let validTrackId;
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
                logger.info(`Tests artists created: ${JSON.stringify(artists, null, 4)}`);
                Promise.all([
                  dbHandler.album.createNewAlbumEntry(constants.initialAlbum1),
                  dbHandler.album.createNewAlbumEntry(constants.initialAlbum2),
                ])
                  .then(albums => {
                    logger.info(`!!!Tests albums created: ${JSON.stringify(albums, null, 4)}`);
                    initialAlbumId = albums[0].id;
                    additionalAlbumId = albums[1].id;

                    const initialTrackInAlbum = constants.initialTrackInAlbum;
                    initialTrackInAlbum.albumId = initialAlbumId; // albumId is set on runtime

                    const initialTrack = constants.initialTrack;
                    initialTrack.albumId = additionalAlbumId; // albumId is set on runtime

                    Promise.all([
                      dbHandler.track.createNewTrackEntry(initialTrackInAlbum),
                      dbHandler.track.createNewTrackEntry(initialTrack),
                    ])
                      .then(tracks => {
                        logger.info(`Tests track in album created: ${JSON.stringify(tracks[0], null, 4)}`);
                        logger.info(`Tests track created: ${JSON.stringify(tracks[1], null, 4)}`);
                        trackInAlbumId = tracks[0][0].id;
                        validTrackId = tracks[1][0].id;
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

  describe('/PUT api/albums/{albumId}/track/{trackId}', () => {
    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should change tracks albumId', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/tracks/${validTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.track.should.have.property('album');
              res.body.track.album.should.have.property('id').eql(initialAlbumId);
              res.body.track.album.should.have.property('name').eql(constants.initialAlbum1.name);
              done();
            });
        });
    });

    it('should return status code 200 if track already belongs to album', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .put(`/api/albums/${initialAlbumId}/track/${validTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .put(`/api/albums/${initialAlbumId}/track/${constants.invalidTrackId}`)
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
        .put(`/api/albums/${initialAlbumId}`)
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
        .delete(`/api/albums/${initialAlbumId}/track/${trackInAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should leave track as orphan', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}/track/${trackInAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/tracks/${trackInAlbumId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.track.should.have.property('album').eql({});
              done();
            });
        });
    });

    it('should return status code 400 if trackId does not belong to album', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}/track/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if albumId does not match an album', done => {
      request(app)
        .delete(`/api/albums/${constants.invalidAlbumId}/track/${trackInAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .delete(`/api/albums/${initialAlbumId}/track/${constants.invalidTrackId}`)
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
        .delete(`/api/albums/${initialAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
