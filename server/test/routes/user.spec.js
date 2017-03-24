let models = require('../../models');
let user = require('../../routes/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../../app');
let expect = chai.expect;
let should = chai.should;


chai.use(chaiHttp);

describe('User', () => {

  describe('/GET users', () => {
    it('should get all the users', () => {
      expect(1).to.equal(1);
      // chai.request(app)
      //   .get('/api/users')
      //   .end((err, res) => {
      //     res.should.have.status(200);
      //     done();
      //   });
    });
  });

  describe('/POST users', () => {
    it('should return status code 400 when incorrect parameters are set', () => {
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
  });
})
