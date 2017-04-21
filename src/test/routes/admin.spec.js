process.env.NODE_ENV = 'test';

const app = require('../../app');
//const db = require('../../models');
const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const constants = require('./admin.constants.json');

describe.skip('Admin', () => {
  /*
  beforeEach((done) => {
    db.sequelize
      .sync({ force: true })
      .then(() => {
        db.admins
          .create(constants.initialAdmin)
          .then(() => {
            done();
          })
          .catch((error) => {
            done(error);
          });
      })
      .catch((error) => {
        done(error);
      });
  });

  afterEach((done) => {
    db.sequelize
      .drop()
      .then(() => {
        done();
      }).catch((error) => {
        done(error);
      });
  });
*/
  describe('/GET admins', () => {
    it('should return status code 200', (done) => {
      request(app)
      .get('/api/admins')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .get('/api/admins')
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('metadata');
          res.body.metadata.should.have.property('version');
          res.body.metadata.should.have.property('count');
          res.body.should.have.property('admins');
          res.body.admins.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST admins', () => {
    it('should return status code 400 when parameters are missing', (done) => {
      request(app)
        .post('/api/admins')
        .send(constants.newAdminWithMissingAttributes)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 400 when parameters are invalid', (done) => {
      request(app)
        .post('/api/admins')
        .send(constants.invalidAdmin)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return status code 201 when correct parameters are sent', (done) => {
      request(app)
        .post('/api/admins')
        .send(constants.testAdmin)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should return the expected body response when correct parameters are sent', (done) => {
      request(app)
        .post('/api/admins')
        .send(constants.testAdmin)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('userName').eql(constants.testAdmin.userName);
          res.body.should.have.property('password').eql(constants.testAdmin.password);
          res.body.should.have.property('firstName').eql(constants.testAdmin.firstName);
          res.body.should.have.property('lastName').eql(constants.testAdmin.lastName);
          res.body.should.have.property('email').eql(constants.testAdmin.email);
          done();
        });
    });
  });

  describe('/DELETE admins/{id}', () => {
    it('should return status code 204 when deletion is successful', (done) => {
      request(app)
        .delete(`/api/admins/${constants.validAdminId}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return status code 404 if id does not match an admin', (done) => {
      request(app)
        .delete(`/api/admins/${constants.invalidAdminId}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
