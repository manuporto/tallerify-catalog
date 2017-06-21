process.env.NODE_ENV = 'test';

const app = require('../../../app');
const db = require('../../../database/index');
const tables = require('../../../database/tableNames');
const dbHandler = require('../../../handlers/db/index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../../utils/logger');

chai.should();
chai.use(chaiHttp);

const config = require('./../../../config');
const constants = require('./album.constants.json');

let initialArtistId1;
let initialArtistId2;
let initialArtistId3;
let initialAlbumId;
let initialTrackId;
let initialArtistShort1;
let initialArtistShort2;
let initialArtistShort3;
let initialTrackShort;

describe('Testy', () => {
  before(done => {
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
  it('testy testy', () => [].should.be.a('array'));
});
