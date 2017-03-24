let models = require('../../models');
let user = require('../../routes/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../../app');
let expect = chai.expect;
let should = chai.should;


chai.use(chaiHttp);

//TODO tests are broken debug them

describe('User', () => {

  describe('/GET users', () => {


    it('should return status code 200', () => {
      chai.request(app)
        .get('/api/users')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST users', () => {
    it('should return status code 400 when incorrect parameters are sent', () => {
      chai.request(app)
        .post('/api/users')
        .send({
          userName: 'jDoe',
          firstName: 'John',
          lastName: 'Doe'
        }).end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });

    it('should return status code 200 when correct parameters are sent', () => {
      chai.request(app)
        .post('/api/users')
        .send({
          userName: 'postTest',
          firstName: 'Post',
          lastName: 'Test',
          country: 'Mocha',
          email: 'post@test.com',
          birthdate: '1/1/1990',
          images: []
        }).end((err, res) => {
        res.should.have.status(200);
        done();
      });
    });

    it('should return the expected body response when correct parameters are sent', () => {
      const expected ={
        id: 0,
        userName: 'postTest',
        firstName: 'Post',
        lastName: 'Test',
        country: 'Mocha',
        email: 'post@test.com',
        birthdate: '1/1/1990',
        images: []
      };
      chai.request(app)
        .post('/api/users')
        .send({
          userName: 'postTest',
          firstName: 'Post',
          lastName: 'Test',
          country: 'Mocha',
          email: 'post@test.com',
          birthdate: '1/1/1990',
          images: []
        }).end((err, res) => {
        res.body.should.equal(expected);
        done();
      });
    });
  });
})
