/**
 * @fileOverview API tests - we test the api as a separate problem domain to the business logic.
 * @name api-tests.js
 * @author 
 * @license 
 */

const expect = require('chai').expect,
      request = require('supertest'),
      express = require('express'),
      app = express();

app.get('/ping', function (req, res) {
  res.status(200).end('pong');
});

describe('ping', function () {

  this.timeout(500);

  context('when being pinged', function () {

    before(function () {
      this.request = request(app).get('/ping');
    })

    it('should return pong' , function (done) {
      this.request.expect('pong', done);
    })

  })
})
