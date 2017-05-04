process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../database');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const config = require('./../../config');
const constants = require('./artist.constants.json');

const testToken = jwt.sign({ admin: true }, config.secret);

describe('Artist', () => {

  beforeEach((done) => {
    db.migrate.rollback()
    .then(() => {
      db.migrate.latest()
      .then(() => done())
      .catch(error => done(error));
    });
  });

  afterEach((done) => {
    db.migrate.rollback()
    .then(() => done());
  });

  describe('/GET artists', () => {

    it('should return status code 200', (done) => {
      request(app)
        .get('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
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
  });

  describe('/POST artists', () => {

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.newArtistWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidArtist)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testArtist)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.testArtist)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name').eql(constants.testArtist.name);
          res.body.should.have.property('popularity').eql(constants.testArtist.popularity);
          done();
        });
    });
  });
});