process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../database/index');
const tables = require('../../database/tableNames');
const dbHandler = require('../../handlers/db/index');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../utils/logger');

chai.should();
chai.use(chaiHttp);

const config = require('./../../config');
const constants = require('./popularity.constants.json');

const user1Token = jwt.sign(constants.jwtTestUser1, config.secret);
const user2Token = jwt.sign(constants.jwtTestUser2, config.secret);

let initialArtistId1;
let initialArtistId2;
let initialArtistShort1;
let initialArtistShort2;
let initialAlbumId;
let initialAlbumShort;
let initialTrackId;
let initialTrackId2;
let initialTrack;
let testTrack;
let updatedTrack;

describe('Popularity', () => {
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

                  initialTrack = Object.assign({}, constants.initialTrack, { albumId: initialAlbumId });
                  initialTrack2 = Object.assign({}, constants.testTrack, {
                    albumId: initialAlbumId,
                    artists: [initialArtistId2],
                  });

                  Promise.all([
                    dbHandler.track.createNewTrackEntry(initialTrack),
                    dbHandler.track.createNewTrackEntry(initialTrack2),
                    ])
                    .then(tracks => {
                      logger.debug(`Tests tracks created: ${JSON.stringify(tracks, null, 4)}`);
                      initialTrackId = tracks[0].id;
                      initialTrackId2 = tracks[1].id;
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

  describe('Every popularity is 0 before rating', () => {
    it('should return track popularity 0', done => {
      request(app)
        .get(`/api/tracks/${initialTrackId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .end((err, res) => {
          logger.warn(JSON.stringify(res.body));
          res.body.track.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return album popularity 0', done => {
      request(app)
        .get(`/api/albums/${initialAlbumId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .end((err, res) => {
          res.body.album.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return artist1 popularity 0', done => {
      request(app)
        .get(`/api/artists/${initialArtistId1}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .end((err, res) => {
          res.body.artist.should.have.property('popularity').eql(0);
          done();
        });
    });

    it('should return artist2 popularity 0', done => {
      request(app)
        .get(`/api/artists/${initialArtistId2}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .end((err, res) => {
          res.body.artist.should.have.property('popularity').eql(0);
          done();
        });
    });
  });

  describe('Every popularity is 3 with a single track rated with 3', () => {
    it('should return track popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith3)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/tracks/${initialTrackId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
              res.body.track.should.have.property('popularity').equal(constants.rateTrackWith3.rate);
              done();
            });
        });
    });

    it('should return album popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith3)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/albums/${initialAlbumId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
              res.body.album.should.have.property('popularity').eql(constants.rateTrackWith3.rate);
              done();
            });
        });
    });

    it('should return artist1 popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith3)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/artists/${initialArtistId1}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
              res.body.artist.should.have.property('popularity').eql(constants.rateTrackWith3.rate);
              done();
            });
        });
    });

    it('should return artist2 popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith3)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .get(`/api/artists/${initialArtistId2}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
              res.body.artist.should.have.property('popularity').eql(constants.rateTrackWith3.rate);
              done();
            });
        });
    });
  });

  describe('Every popularity is 4 with a single track rated with 2, 4 by the same user', () => {
    it('should return track popularity 4', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/tracks/${initialTrackId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.track.should.have.property('popularity').eql(4);
                  done();
                });
            });
        });
    });

    it('should return album popularity 4', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/albums/${initialAlbumId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.album.should.have.property('popularity').eql(4);
                  done();
                });
            });
        });
    });

    it('should return artist1 popularity 4', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId1}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(4);
                  done();
                });
            });
        });
    });

    it('should return artist2 popularity 4', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId2}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(4);
                  done();
                });
            });
        });
    });
  });

  describe('Every popularity is 3 with a single track rated with 2, 4 by different users', () => {
    it('should return track popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/tracks/${initialTrackId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.track.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });

    it('should return album popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/albums/${initialAlbumId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.album.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });

    it('should return artist1 popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId1}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });

    it('should return artist2 popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId2}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });
  });

  describe('Every popularity is 3 with a track rated with 2, and a track rated with 4 by different users', () => {
    it('should return album popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId2}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/albums/${initialAlbumId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.album.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });

    it('should return artist1 popularity 4', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId2}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId1}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(4);
                  done();
                });
            });
        });
    });

    it('should return artist2 popularity 3', done => {
      request(app)
        .post(`/api/tracks/${initialTrackId}/popularity`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(constants.rateTrackWith2)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/tracks/${initialTrackId2}/popularity`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(constants.rateTrackWith4)
            .end((err, res) => {
              res.should.have.status(201);
              request(app)
                .get(`/api/artists/${initialArtistId2}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                  res.body.artist.should.have.property('popularity').eql(3);
                  done();
                });
            });
        });
    });
  });
});
