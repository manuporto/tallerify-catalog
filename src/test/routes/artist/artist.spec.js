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
const constants = require('./artist.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

let initialArtistId;
let initialAlbumId;
let initialAlbumShort;
let initialTrackId;
let testTrack;

describe('Artist', () => {
  beforeEach(done => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.artist.createNewArtistEntry(constants.initialArtist)
              .then(artist => {
                logger.debug(`Tests artists created: ${JSON.stringify(artist, null, 4)}`);
                initialArtistId = artist.id;
                dbHandler.album.createNewAlbumEntry(
                  Object.assign({}, constants.initialAlbum, { artists: [initialArtistId] }))
                  .then(album => {
                    logger.debug(`Tests album created: ${JSON.stringify(album, null, 4)}`);
                    initialAlbumId = album.id;
                    initialAlbumShort = {
                      id: initialAlbumId,
                      name: album.name,
                      href: null,
                      images: album.images,
                    };
                    dbHandler.track.createNewTrackEntry(
                      Object.assign({}, constants.initialTrack, {
                        artists: [initialArtistId],
                        albumId: initialAlbumId,
                      }))
                      .then(track => {
                        logger.debug(`Tests track created: ${JSON.stringify(track, null, 4)}`);
                        initialTrackId = track.id;
                        testTrack = Object.assign({}, constants.testTrack, {
                          albumId: initialAlbumId,
                          artists: [initialArtistId],
                        });
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

  describe('/GET artists', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
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

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get('/api/artists')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET artists?name=', () => {
    it('should return status code 200 with existent artist name', done => {
      request(app)
        .get(`/api/artists?name=${constants.initialArtist.name}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 with non existent artist name', done => {
      request(app)
        .get('/api/artists?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return artists matching with the name in the query', done => {
      request(app)
        .get(`/api/artists?name=${constants.initialArtist.name}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('artists');
          res.body.artists.should.be.a('array');
          res.body.artists.should.have.lengthOf(1);
          res.body.artists.map(artist => artist.name.should.eql(constants.initialArtist.name));
          done();
        });
    });

    it('should return no artists if the name query doesn\'t match any album ', done => {
      request(app)
        .get('/api/artists?name=INEXISTENT')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('artists').eql([]);
          done();
        });
    });

    it('should return no artists if the name query it\'s empty', done => {
      request(app)
        .get('/api/artists?name=')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.have.property('artists').eql([]);
          done();
        });
    });
  });

  describe('/POST artists', () => {
    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newArtistWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testArtist)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
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
          res.body.should.have.property('images');
          res.body.should.have.property('popularity').eql(0);
          res.body.should.have.property('albums').eql([]);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
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
    it('should return status code 200', done => {
      request(app)
        .get(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return artist data', done => {
      request(app)
        .get(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('artist');
          res.body.artist.should.have.property('id').eql(initialArtistId);
          res.body.artist.should.have.property('name').eql(constants.initialArtist.name);
          res.body.artist.should.have.property('description').eql(constants.initialArtist.description);
          res.body.artist.should.have.property('href');
          res.body.artist.should.have.property('albums').eql([initialAlbumShort]);
          res.body.artist.should.have.property('genres').eql(constants.initialArtist.genres);
          res.body.artist.should.have.property('images').eql(constants.initialArtist.images);
          res.body.artist.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .get(`/api/artists/${constants.invalidArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/artists/${constants.invalidArtistId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT artists/{id}', () => {
    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .put(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedArtist)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .put(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedArtist)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(initialArtistId);
          res.body.should.have.property('name').eql(constants.updatedArtist.name);
          res.body.should.have.property('description').eql(constants.updatedArtist.description);
          res.body.should.have.property('href');
          res.body.should.have.property('albums').eql([initialAlbumShort]);
          res.body.should.have.property('genres').eql(constants.updatedArtist.genres);
          res.body.should.have.property('images').eql(constants.updatedArtist.images);
          res.body.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .put(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedArtistWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', done => {
      request(app)
        .put(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .put(`/api/artists/${constants.invalidArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedArtist)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/artists/${initialArtistId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedArtist)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE artists/{id}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .delete(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should remove artist from his album', done => {
      request(app)
        .delete(`/api/artists/${initialArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/albums/${initialAlbumId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.album.should.have.property('artists').eql([]);
              done();
            });
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .delete(`/api/artists/${constants.invalidArtistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/artists/${initialArtistId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET /api/artists/{id}/tracks', () => {
    it('should return status code 200', done => {
      request(app)
        .get(`/api/artists/${initialArtistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get(`/api/artists/${initialArtistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('tracks');
          res.body.tracks.should.have.lengthOf(1);
          res.body.tracks[0].should.have.property('id').eql(initialTrackId);
          res.body.tracks[0].should.have.property('name').eql(constants.initialTrack.name);
          res.body.tracks[0].should.have.property('duration');
          res.body.tracks[0].should.have.property('href');
          res.body.tracks[0].should.have.property('album');
          res.body.tracks[0].should.have.property('popularity');
          done();
        });
    });

    it('should return the expected body response with new track', done => {
      request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${testToken}`)
        .send(testTrack)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/artists/${initialArtistId}/tracks`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.tracks.should.have.lengthOf(2);
              done();
            });
        });
    });

    it('should return the expected body response with no tracks', done => {
      request(app)
        .delete(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/artists/${initialArtistId}/tracks`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.tracks.should.have.lengthOf(0);
              done();
            });
        });
    });

    it('should return status code 404 if id does not match an artist', done => {
      request(app)
        .get(`/api/artists/${constants.invalidArtistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/artists/${initialArtistId}/tracks`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
