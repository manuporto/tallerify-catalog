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
const constants = require('./user.constants.json');

const testToken = jwt.sign({ admin: true }, config.secret);

describe('User', () => {
  beforeEach((done) => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {
            dbHandler.createNewEntry(tables.users, constants.initialUser)
              .then(() => done())
              .catch(error => done(error));
          })
          .catch(error => done(error));
      });
  });

  afterEach((done) => {
    db.migrate.rollback()
      .then(() => done());
  });

  describe('/GET users', () => {
    it('should return status code 200', (done) => {
      request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${testToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('users');
          res.body.users.should.be.a('array');
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST users', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/users')
        .send(constants.newUserWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .post('/api/users')
        .send(constants.invalidUser)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .post('/api/users')
        .send(constants.testUser)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .post('/api/users')
        .send(constants.testUser)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('userName').eql(constants.testUser.userName);
          res.body.should.have.property('password').eql(constants.testUser.password);
          res.body.should.have.property('fb');
          res.body.should.have.property('firstName').eql(constants.testUser.firstName);
          res.body.should.have.property('lastName').eql(constants.testUser.lastName);
          res.body.should.have.property('country').eql(constants.testUser.country);
          res.body.should.have.property('email').eql(constants.testUser.email);
          res.body.should.have.property('birthdate').eql(constants.testUser.birthdate);
          res.body.should.have.property('images');
          done();
        });
    });
  });

  describe('/GET users/{id}', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return user data', (done) => {
      request(app)
        .get(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('user');
          res.body.user.should.be.a('object');
          res.body.user.should.have.property('id').eql(constants.validUserId);
          res.body.user.should.have.property('userName').eql(constants.initialUser.userName);
          res.body.user.should.have.property('password').eql(constants.initialUser.password);
          res.body.user.should.have.property('firstName').eql(constants.initialUser.firstName);
          res.body.user.should.have.property('lastName').eql(constants.initialUser.lastName);
          res.body.user.should.have.property('country').eql(constants.initialUser.country);
          res.body.user.should.have.property('email').eql(constants.initialUser.email);
          res.body.user.should.have.property('birthdate').eql(constants.initialUser.birthdate);
          res.body.user.should.have.property('images').eql(constants.initialUser.images);
          res.body.user.should.have.property('href');
          // res.body.should.have.property('contacts'); FIXME add contacts assoc
          done();
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .get(`/api/users/${constants.invalidUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get(`/api/users/${constants.validUserId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT users/{id}', () => {
    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .put(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('userName').eql(constants.updatedUser.userName);
          res.body.should.have.property('password').eql(constants.updatedUser.password);
          res.body.should.have.property('fb');
          res.body.should.have.property('firstName').eql(constants.updatedUser.firstName);
          res.body.should.have.property('lastName').eql(constants.updatedUser.lastName);
          res.body.should.have.property('country').eql(constants.updatedUser.country);
          res.body.should.have.property('email').eql(constants.updatedUser.email);
          res.body.should.have.property('birthdate').eql(constants.updatedUser.birthdate);
          res.body.images.should.have.lengthOf(2);//res.body.should.have.property('images').eql(constants.updatedUser.images);
          done();
        });
    });

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .put(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUserWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .put(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.invalidUser)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .put(`/api/users/${constants.invalidUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .put(`/api/users/${constants.validUserId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE users/{id}', () => {
    it('should return status code 204 when deletion is successful', (done) => {
      request(app)
        .delete(`/api/users/${constants.validUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .delete(`/api/users/${constants.invalidUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .delete(`/api/users/${constants.validUserId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
