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
const constants = require('./user.me.constants.json');

const initialUserToken = jwt.sign(constants.initialUser, config.secret);
const invalidUserToken = jwt.sign(constants.invalidUser, config.secret);

describe('User me', () => {

  beforeEach((done) => {
    db.migrate.rollback()
      .then(() => {
        db.migrate.latest()
          .then(() => {

            dbHandler.createNewEntry(tables.users, [ constants.initialUser, constants.initialContact ])
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

  describe('/GET users/me', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return user data', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
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
          res.body.user.images.should.have.lengthOf(3);
          res.body.user.should.have.property('href');
          res.body.user.should.have.property('contacts').eql([]);
          done();
        });
    });

    it('should return status code 404 if token does not match a user', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${invalidUserToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT users/me', () => {
    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
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
          res.body.should.have.property('images');
          res.body.images.should.have.lengthOf(2);//.eql(constants.updatedUser.images);
          res.body.should.have.property('contacts').eql([]);
          done();
        });
    });

    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .send(constants.updatedUserWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .send(constants.invalidUser)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${invalidUserToken}`)
        .send(constants.updatedUser)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET users/me/contacts', () => {
    it('should return status code 200', (done) => {
      request(app)
        .get('/api/users/me/contacts')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .get('/api/users/me/contacts')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          console.log(`Res: ${JSON.stringify(res.body, null, 4)}`);
          res.body.should.be.a('object');
          res.body.should.have.property('contacts').eql([]);
          // res.body.contacts.should.have.lengthOf(1); TODO add contacts to test user
          // res.body.contacts[0].should.be.a('object');
          done();
        });
    })
    //TODO add tests

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .get('/api/users/me/contacts')
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST users/me/contacts/{id}', () => {
    it('should return status code 201 when contact addition is successful', (done) => {
      request(app)
        .post(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return status code 201 when contact addition is duplicated', (done) => {
      request(app)
        .post(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .post(`/api/users/me/contacts/${constants.validContactId}`)
            .set('Authorization', `Bearer ${initialUserToken}`)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
    });

    it('should return status code 404 if id does not match a user', (done) => {
      request(app)
        .post(`/api/users/me/contacts/${constants.invalidContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .post(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/DELETE users/me/contacts/{id}', () => {
    it('should return status code 204 when contact deletion is successful', (done) => {
      request(app)
        .post(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(201);
          request(app)
            .delete(`/api/users/me/contacts/${constants.validContactId}`)
            .set('Authorization', `Bearer ${initialUserToken}`)
            .end((err, res) => {
              res.should.have.status(204);
              done();
            });
        });
    });

    it('should return status code 204 if deleted contact was never added', (done) => {
      request(app)
        .delete(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match a contact', (done) => {
      request(app)
        .delete(`/api/users/me/contacts/${constants.invalidContactId}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return status code 401 if unauthorized', (done) => {
      request(app)
        .delete(`/api/users/me/contacts/${constants.validContactId}`)
        .set('Authorization', 'Bearer UNAUTHORIZED')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
