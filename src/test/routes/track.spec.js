process.env.NODE_ENV = 'test';

const app = require('../../app'); 
const db = require('../../database');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const constants = require('./track.constants.json');

describe('Track', () => {

  before(done => {
    db.migrate.rollback()
    .then(() => {
      db.migrate.latest()
      .then(() => done())
      .catch(error => done(error));
    });
  });

  after(done => {
    db.migrate.rollback()
    .then(() => done());
  });
  
  describe('/GET tracks', () => {
    it('should return status code 200', done => {
      request(app)
        .get('/api/tracks')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get('/api/tracks')
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('tracks');
          res.body.tracks.should.be.a('array');
          done();
        });
    });
  });
});