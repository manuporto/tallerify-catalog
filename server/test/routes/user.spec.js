process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../models');
let request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

const constants = require('./constants.json');

describe('User', () => {

  before(done => {
    db.users
      .sync({force: true})
      .then(() => {
        db.users
          .create({
            userName: constants.initialUser.userName,
            password: constants.initialUser.password,
            firstName: constants.initialUser.firstName,
            lastName: constants.initialUser.lastName,
            country: constants.initialUser.country,
            email: constants.initialUser.email,
            birthdate: constants.initialUser.birthdate,
            images: constants.initialUser.images
          })
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

  describe('/GET users', () => {
    it('should return status code 200', done => {
      request(app)
      .get("/api/users")
      .end((err,res) => {
        res.should.have.status(200);
        done();
      });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .get("/api/users")
        .end((err,res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('users');
          res.body.users.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST users', () => {
    it('should return status code 400 when parameters are missing', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: constants.testUser.userName,
          firstName: constants.testUser.firstName,
          lastName: constants.testUser.lastName,
        }).end((err, res) => {
          res.should.have.status(400);
          done();
      });
    });

    it('should return status code 400 when parameters invalid', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: constants.invalidUser.userName,
          password: constants.invalidUser.password,
          firstName: constants.invalidUser.firstName,
          lastName: constants.invalidUser.lastName,
          country: constants.invalidUser.country,
          email: constants.invalidUser.email,
          birthdate: constants.invalidUser.birthdate,
          images: constants.invalidUser.images
        }).end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });

    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: constants.testUser.userName,
          password: constants.testUser.password,
          firstName: constants.testUser.firstName,
          lastName: constants.testUser.lastName,
          country: constants.testUser.country,
          email: constants.testUser.email,
          birthdate: constants.testUser.birthdate,
          images: constants.testUser.images
        }).end((err, res) => {
          res.should.have.status(201);
          done();
      });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: constants.testUser.userName,
          password: constants.testUser.password,
          firstName: constants.testUser.firstName,
          lastName: constants.testUser.lastName,
          country: constants.testUser.country,
          email: constants.testUser.email,
          birthdate: constants.testUser.birthdate,
          images: constants.testUser.images
        }).end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('userName').eql(constants.testUser.userName);
          res.body.should.have.property('password').eql(constants.testUser.password);
          res.body.should.have.property('firstName').eql(constants.testUser.firstName);
          res.body.should.have.property('lastName').eql(constants.testUser.lastName);
          res.body.should.have.property('country').eql(constants.testUser.country);
          res.body.should.have.property('email').eql(constants.testUser.email);
          res.body.should.have.property('birthdate').eql(constants.testUser.birthdate);
          res.body.should.have.property('images').eql(constants.testUser.images);
          res.body.should.have.property('contacts');
          res.body.should.have.property('href');
          done();
      });
    });
  });

  describe('/GET users/{id}', () => {
    it('should return status code 200', done => {
      request(app)
        .get(`/api/users/${constants.initialUser.id}`)
        .end((err,res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return user data', done => {
      request(app)
        .get(`/api/users/${constants.initialUser.id}`)
        .end((err,res) => {
          res.body.should.be.a('object');
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(constants.initialUser.id);
          res.body.should.have.property('userName').eql(constants.initialUser.userName);
          res.body.should.have.property('password').eql(constants.initialUser.password);
          res.body.should.have.property('firstName').eql(constants.initialUser.firstName);
          res.body.should.have.property('lastName').eql(constants.initialUser.lastName);
          res.body.should.have.property('country').eql(constants.initialUser.country);
          res.body.should.have.property('email').eql(constants.initialUser.email);
          res.body.should.have.property('birthdate').eql(constants.initialUser.birthdate);
          res.body.should.have.property('images').eql(constants.initialUser.images);
          res.body.should.have.property('contacts');
          res.body.should.have.property('href');
          done();
        });
    });

    it('should return status code 404 if id does not match a user', done => {
      request(app)
        .get(`/api/users/${constants.invalidUserId}`)
        .end((err,res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

});
