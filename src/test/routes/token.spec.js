process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../database');
const tables = require('../../database/tableNames');
const dbHandler = require('../../handlers/db/generalHandler');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const constants = require('./token.constants.json');

describe('Token', () => {
  beforeEach((done) => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            Promise.all([
              dbHandler.createNewEntry(tables.users,
                [constants.initialUser, constants.initialFacebookUser]),
              dbHandler.createNewEntry(tables.admins, constants.initialAdmin),
            ]).then(() => done()).catch(error => done(error));
          })
          .catch(error => done(error));
      });
  });

  afterEach((done) => {
    db.migrate.rollback()
      .then(() => done());
  });

  describe('/POST tokens with native login', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGenerationWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when credentials dont match', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.invalidCredentials)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGeneration)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct credentials are sent', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGeneration)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          // res.body.should.have.property('user');
          // res.body.user.should.have.property('id');
          // res.body.user.should.have.property('userName');
          // res.body.user.should.have.property('href');
          done();
        });
    });
  });

  describe('/POST tokens with facebook login', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.facebookTokenGenerationWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 401 when user token is invalid or expired', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.facebookTokenGenerationWithInvalidCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return status code 201', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.facebookTokenGeneration)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct credentials are sent', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.facebookTokenGeneration)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          // res.body.should.have.property('user');
          // res.body.user.should.have.property('id');
          // res.body.user.should.have.property('userName');
          // res.body.user.should.have.property('href');
          done();
        });
    });

    it('should return existing information when logging with existing user', (done) => {
      request(app)
        .post('/api/tokens')
        .send(constants.existingFacebookTokenGeneration)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          // res.body.should.have.property('user');
          // res.body.user.should.have.property('id');
          // res.body.user.should.have.property('userName');
          // res.body.user.userName.should.equal(constants.initialFacebookUser.userName);
          // res.body.user.should.have.property('href');
          done();
        });
    });
  });

  describe('/POST admins/tokens', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/admins/tokens')
        .send(constants.adminTokenGenerationWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when credentials dont match', (done) => {
      request(app)
        .post('/api/admins/tokens')
        .send(constants.adminInvalidCredentials)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201', (done) => {
      request(app)
        .post('/api/admins/tokens')
        .send(constants.adminTokenGeneration)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct credentials are sent', (done) => {
      request(app)
        .post('/api/admins/tokens')
        .send(constants.adminTokenGeneration)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          res.body.should.have.property('admin');
          res.body.admin.should.have.property('id');
          res.body.admin.should.have.property('userName');
          done();
        });
    });
  });
});
