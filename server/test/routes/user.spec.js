// process.env.NODE_ENV = 'test';

// let user = require('../../routes/user');

//Require the dev-dependencies
// var assert = require('assert');
// let chai = require('chai');
// let chaiHttp = require('chai-http');
// let app = require('../../app');
// let should = chai.should();


// chai.use(chaiHttp);

// var supertest = require("supertest");
// var should = require("should");
//
// var server = supertest.agent("http://localhost:3000");

const app = require('../../app');
let request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

describe('User', () => {

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
          userName: 'jDoe',
          firstName: 'John',
          lastName: 'Doe'
        }).end((err, res) => {
          res.should.have.status(400);
          done();
      });
    });

    it('should return status code 201 when correct parameters are sent', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: 'abrden',
          password: '1234',
          firstName: 'Agustina',
          lastName: 'Barbetta',
          country: 'Argentina',
          email: 'a@a.com',
          birthdate: '12/8/1994',
          images: [ 'hello', 'world']
        }).end((err, res) => {
          res.should.have.status(201);
          done();
      });
    });

    it('should return the expected body response when correct parameters are sent', done => {
      request(app)
        .post('/api/users')
        .send({
          userName: 'abrden',
          password: '1234',
          firstName: 'Agustina',
          lastName: 'Barbetta',
          country: 'Argentina',
          email: 'a@a.com',
          birthdate: '12/8/1994',
          images: [ 'hello', 'world']
        }).end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('userName').eql('abrden');
          res.body.should.have.property('password').eql('1234');
          res.body.should.have.property('firstName').eql('Agustina');
          res.body.should.have.property('lastName').eql('Barbetta');
          res.body.should.have.property('country').eql('Argentina');
          res.body.should.have.property('email').eql('a@a.com');
          res.body.should.have.property('birthdate').eql('12/8/1994');
          res.body.should.have.property('images').eql([ 'hello', 'world']);
          res.body.should.have.property('contacts');
          res.body.should.have.property('href');
          done();
      });
    });
  });


});
