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
const constants = require('./playlist.extra.constants.json');

const testToken = jwt.sign(constants.jwtTestUser, config.secret);

let initialArtistId;
let initialAlbumId;
let initialUserId;
let validTrackId;
let validPlaylistId;
describe('Playlist', () => {
  beforeEach(done => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.general.createNewEntry(tables.users, constants.initialUser)
              .then(owner => {
                logger.info(`Tests user created: ${JSON.stringify(owner, null, 4)}`);
                initialUserId = owner[0].id;
                dbHandler.artist.createNewArtistEntry(constants.initialArtist)
                  .then(artist => {
                    logger.info(`Tests artist created: ${JSON.stringify(artist, null, 4)}`);
                    initialArtistId = artist[0].id;

                    const initialAlbum = constants.initialAlbum;
                    initialAlbum.artists = [initialArtistId];

                    dbHandler.album.createNewAlbumEntry(initialAlbum)
                      .then(album => {
                        logger.info(`Tests album created: ${JSON.stringify(album, null, 4)}`);
                        initialAlbumId = album[0].id;

                        const initialTrackInPlaylist = constants.initialTrackInPlaylist;
                        initialTrackInPlaylist.albumId = initialAlbumId;
                        initialTrackInPlaylist.artists = [initialArtistId];

                        const initialTrack = constants.initialTrack;
                        initialTrack.albumId = initialAlbumId;
                        initialTrack.artists = [initialArtistId];

                        Promise.all([
                          dbHandler.track.createNewTrackEntry(initialTrackInPlaylist),
                          dbHandler.track.createNewTrackEntry(initialTrack),
                        ])
                          .then(tracks => {
                            logger.info(`Tests tracks created: ${JSON.stringify(tracks, null, 4)}`);
                            const initialTrackInPlaylistId = tracks[0][0].id;
                            validTrackId = tracks[1][0].id;

                            const initialPlaylist = constants.initialPlaylist;
                            initialPlaylist.ownerId = initialUserId;
                            initialPlaylist.songs = [initialTrackInPlaylistId];

                            dbHandler.playlist.createNewPlaylistEntry(initialPlaylist)
                              .then(playlist => {
                                logger.info(`Tests playlist created: ${JSON.stringify(playlist, null, 4)}`);
                                validPlaylistId = playlist[0].id;
                                done();
                              })
                              .catch(error => {
                                logger.warn(`Test playlist creation error: ${error}`);
                                done(error);
                              });
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
                    logger.warn(`Test artist creation error: ${error}`);
                    done(error);
                  });
              })
              .catch(error => {
                logger.warn(`Test user creation error: ${error}`);
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

  describe('/PUT api/playlists/{playlistId}/tracks/{trackId}', () => {
    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/tracks`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              logger.warn(JSON.stringify(res.body));
              res.body.tracks[0].should.have.property('name').eql(constants.initialTrack.name);
              done();
            });
        });
    });

    it('should return status code 200 if track already belongs to playlist', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if id does not match a playlist', done => {
      request(app)
        .put(`/api/playlists/${constants.invalidPlaylistId}/tracks/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if playlistId and trackId are invalid', done => {
      request(app)
        .put(`/api/playlists/${constants.invalidPlaylistId}/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedAlbum)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
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
              res.body.track.should.not.have.property('album');
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
