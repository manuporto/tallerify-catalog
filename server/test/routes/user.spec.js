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

var app = require('../../app');
var request = require('supertest');
var chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
var expect = chai.expect;

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

    it('should return status code 200 when correct parameters are sent', done => {
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
      const expected ={
        id: 0,
        userName: 'postTest',
        password: '1234',
        firstName: 'Post',
        lastName: 'Test',
        country: 'Mocha',
        email: 'post@test.com',
        birthdate: '1/1/1990',
        images: ['']
      };
      request(app)
        .post('/api/users')
        .send({
          userName: 'postTest',
          password: '1234',
          firstName: 'Post',
          lastName: 'Test',
          country: 'Mocha',
          email: 'post@test.com',
          birthdate: '1/1/1990',
          images: ['']
        }).end((err, res) => {
        expect(res.body).to.equal(expected);
        done();
      });
    });
  });
})
