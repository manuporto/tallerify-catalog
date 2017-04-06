process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../models');
let request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

const constants = require('./constants.json');

describe('Token', () => {

  beforeEach(done => {
    db.sequelize
      .sync({force: true})
      .then(() => {
        db.users
          .create(constants.initialUser)
          .then(user => {
            done();
          })
          .catch(error => {
            done(error);
          })
      })
      .catch(error => {
        done(error);
      });
  });

  afterEach(done => {
    db.sequelize
      .drop()
      .then(() => {
        done();
      }).catch(error => {
      done(error);
    })
  });

  describe('/POST tokens', () => {
    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGenerationWithMissingAttributes)
        .end((err, res) => {
         res.should.have.status(400);
         done();
      });
    });

    it('should return status code 500 when credentials dont match', done => {
      request(app)
        .post('/api/tokens')
        .send(constants.invalidCredentials)
        .end((err, res) => {
          res.should.have.status(500);
          done();
      });
    });

    it('should return status code 201', done => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGeneration)
        .end((err, res) => {
          res.should.have.status(201);
          done();
      });
    });

    it('should return the expected body response when correct credentials are sent', done => {
      request(app)
        .post('/api/tokens')
        .send(constants.tokenGeneration)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          res.body.should.have.property('user');
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('userName');
          res.body.user.should.have.property('href');
          done();
      });
    });

  });

});
