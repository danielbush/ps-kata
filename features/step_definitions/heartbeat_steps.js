'use strict';

module.exports = function () {
  this.World = require('../support/world');
  require('../support/hooks').call(this);

  this.Before(function () {
  });

  this.Given(/^an agent is running on a target server$/, function (callback) {
    callback.pending();
  });

};
