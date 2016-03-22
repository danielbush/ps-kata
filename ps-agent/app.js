/**
 * @fileOverview Main express application
 * @name app.js
 * @author 
 * @license BSD 2 clause
 */


const express = require('express'),
      app = express();

app.get('/ping', function (req, res) {
  res.status(200).end('pong');
});

module.exports = app;
