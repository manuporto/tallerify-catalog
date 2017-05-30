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

let validAlbumId;
let validTrackId;
let validPlaylistId;
let albumInPlaylistId;
let trackInPlaylistId;
describe('Playlist', () => {
  beforeEach(done => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.general.createNewEntry(tables.users, constants.initialUser)
              .then(owner => {
                logger.info(`Tests user created: ${JSON.stringify(owner, null, 4)}`);
                const initialUserId = owner[0].id;
                dbHandler.artist.createNewArtistEntry(constants.initialArtist)
                  .then(artist => {
                    logger.info(`Tests artist created: ${JSON.stringify(artist, null, 4)}`);
                    const initialArtistId = artist.id;

                    const albumInPlaylist = constants.initialAlbumInPlaylist;
                    albumInPlaylist.artists = [initialArtistId];

                    const initialAlbum = constants.initialAlbum;
                    initialAlbum.artists = [initialArtistId];

                    Promise.all([
                      dbHandler.album.createNewAlbumEntry(albumInPlaylist),
                      dbHandler.album.createNewAlbumEntry(initialAlbum),
                    ])
                      .then(albums => {
                        logger.info(`Tests albums created: ${JSON.stringify(albums, null, 4)}`);
                        albumInPlaylistId = albums[0].id;
                        validAlbumId = albums[1].id;

                        const initialTrackInPlaylist = constants.initialTrackInPlaylist;
                        initialTrackInPlaylist.albumId = validAlbumId;
                        initialTrackInPlaylist.artists = [initialArtistId];

                        const initialTrack = constants.initialTrack;
                        initialTrack.albumId = albumInPlaylistId;
                        initialTrack.artists = [initialArtistId];

                        Promise.all([
                          dbHandler.track.createNewTrackEntry(initialTrackInPlaylist),
                          dbHandler.track.createNewTrackEntry(initialTrack),
                        ])
                          .then(tracks => {
                            logger.info(`Tests tracks created: ${JSON.stringify(tracks, null, 4)}`);
                            trackInPlaylistId = tracks[0].id;
                            validTrackId = tracks[1].id;

                            const initialPlaylist = constants.initialPlaylist;
                            initialPlaylist.ownerId = initialUserId;
                            initialPlaylist.songs = [trackInPlaylistId];

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
              // FIXME logger.warn(JSON.stringify(res.body));
              // res.body.tracks[0].should.have.property('name').eql(constants.initialTrack.name);
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
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/tracks/${validTrackId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE api/playlists/{playlistId}/tracks/{trackId}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .delete(`/api/playlists/${validPlaylistId}/tracks/${trackInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if playlistId does not match a playlist', done => {
      request(app)
        .delete(`/api/playlists/${constants.invalidPlaylistId}/tracks/${trackInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if trackId does not match a track', done => {
      request(app)
        .delete(`/api/playlists/${validPlaylistId}/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if playlistId and trackId are invalid', done => {
      request(app)
        .delete(`/api/playlists/${constants.invalidPlaylistId}/tracks/${constants.invalidTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .delete(`/api/playlists/${validPlaylistId}/tracks/${trackInPlaylistId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT api/playlists/{playlistId}/albums/{albumId}', () => {
    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${validAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return status code 200 when correct parameters are sent', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${validAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/albums`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.albums[0].should.have.property('name').eql(constants.initialAlbum.name);
              done();
            });
        });
    });

    it('should return status code 200 if album already belongs to playlist', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${validAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .put(`/api/playlists/${validPlaylistId}/albums/${validAlbumId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return status code 404 if trackId does not match an album', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if id does not match a playlist', done => {
      request(app)
        .put(`/api/playlists/${constants.invalidPlaylistId}/albums/${validTrackId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 404 if playlistId and albumId are invalid', done => {
      request(app)
        .put(`/api/playlists/${constants.invalidPlaylistId}/albums/${constants.invalidAlbumId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${validAlbumId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE api/playlists/{playlistId}/albums/{trackId}', () => {
    it('should return status code 204 when deletion is successful', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .delete(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              done();
            });
        });
    });

    it('should return status code 404 if playlistId does not match a playlist', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .delete(`/api/playlists/${constants.invalidPlaylistId}/albums/${albumInPlaylistId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
    });

    it('should return status code 404 if playlistId does not match an album', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .delete(`/api/playlists/${validPlaylistId}/albums/${constants.invalidAlbumId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
    });

    it('should return status code 404 if playlistId and albumId are invalid', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .delete(`/api/playlists/${constants.invalidPlaylistId}/albums/${constants.invalidAlbumId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .delete(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
            .set('Authorization', 'Bearer UNAUTHORIZED')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
        });
    });
  });

  describe('/GET /api/playlists/{playlistId}/albums', () => {
    it('should return status code 200', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/albums`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/albums`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.albums.should.have.lengthOf(1);
              res.body.albums[0].should.have.property('name').eql(constants.initialAlbumInPlaylist.name);
              res.body.albums[0].should.have.property('images').eql(constants.initialAlbumInPlaylist.images);
              res.body.albums[0].should.have.property('genres').eql(constants.initialAlbumInPlaylist.genres);
              res.body.albums[0].should.have.property('release_date').eql(constants.initialAlbumInPlaylist.release_date);
              // TODO check artists & tracks
              done();
            });
        });
    });

    it('should return status code 200 and empty array for playlist with no albums', done => {
      request(app)
        .get(`/api/playlists/${validPlaylistId}/albums`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.albums.should.have.lengthOf(0);
          done();
        });
    });

    it('should return status code 404 if playlistId is invalid', done => {
      request(app)
        .get(`/api/playlists/${constants.invalidPlaylistId}/albums`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/albums`)
            .set('Authorization', 'Bearer UNAUTHORIZED')
            .end((err, res) => {
              res.should.have.status(401);
              done();
            });
        });
    });
  });

  describe('/GET /api/playlists/{playlistId}/tracks', () => {
    it('should return status code 200', done => {
      request(app)
        .get(`/api/playlists/${validPlaylistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get(`/api/playlists/${validPlaylistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          logger.warn(JSON.stringify(res.body));
          res.body.tracks.should.have.lengthOf(1);
          res.body.tracks[0].should.have.property('name').eql(constants.initialTrackInPlaylist.name);
          // TODO check artists & album
          done();
        });
    });

    it('should return tracks and album tracks', done => {
      request(app)
        .put(`/api/playlists/${validPlaylistId}/albums/${albumInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/tracks`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.tracks.should.have.lengthOf(2);
              res.body.tracks[0].should.have.property('name').eql(constants.initialTrackInPlaylist.name);
              res.body.tracks[1].should.have.property('name').eql(constants.initialTrack.name);
              done();
            });
        });
    });

    it('should return status code 200 and empty array for playlist with no tracks', done => {
      request(app)
        .delete(`/api/playlists/${validPlaylistId}/tracks/${trackInPlaylistId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          request(app)
            .get(`/api/playlists/${validPlaylistId}/tracks`)
            .set('Authorization', `Bearer ${testToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('metadata');
              res.body.metadata.should.have.property('version');
              res.body.metadata.should.have.property('count');
              res.body.tracks.should.have.lengthOf(0);
              done();
            });
        });
    });

    it('should return status code 404 if playlistId is invalid', done => {
      request(app)
        .get(`/api/playlists/${constants.invalidPlaylistId}/tracks`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', done => {
      request(app)
        .get(`/api/playlists/${validPlaylistId}/tracks`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
