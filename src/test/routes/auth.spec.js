process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../database');
const tables = require('../../database/tableNames');
const dbHandler = require('../../handlers/db/generalHandler');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const config = require('./../../config');
const constants = require('./auth.constants.json');

const validToken = jwt.sign({ admin: true }, config.secret);
const expiredToken = constants.expiredToken;
const malformedToken = constants.malformedToken;

describe('Authentication', () => {
  before(done => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.createNewEntry(tables.admins, constants.initialAdmin)
              .then(() => done())
              .catch(error => done(error));
          })
          .catch(error => done(error));
      });
  });

  after(done => {
    db.migrate.rollback()
      .then(() => done());
  });

  describe('/GET admins', () => {
    it('should return status code 401 due to expired token', done => {
      request(app)
        .get('/api/admins')
        .set('Authorization', `Bearer ${expiredToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('code').eql(constants.expiredTokenResponse.code);
          res.body.should.have.property('message').eql(constants.expiredTokenResponse.message);
          done();
        });
    });

    it('should return status code 401 due to malformed token', done => {
      request(app)
        .get('/api/admins')
        .set('Authorization', `Bearer ${malformedToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('code').eql(constants.malformedTokenResponse.code);
          res.body.should.have.property('message').eql(constants.malformedTokenResponse.message);
          done();
        });
    });

    it('should return status code 401 due to auth header absence', done => {
      request(app)
        .get('/api/admins')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('code').eql(constants.noAuthHeaderResponse.code);
          res.body.should.have.property('message').eql(constants.noAuthHeaderResponse.message);
          done();
        });
    });

    it('should return status code 401 due to malformed token', done => {
      request(app)
        .get('/api/admins')
        .set('Authorization', `JWT ${validToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('code').eql(constants.malformedAuthHeaderResponse.code);
          res.body.should.have.property('message').eql(constants.malformedAuthHeaderResponse.message);
          done();
        });
    });

    it('should return status code 200 due to valid token', done => {
      request(app)
        .get('/api/admins')
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
});
