'use strict';

const utils = require('../../utils');

module.exports = function () {
  this.registerHandler('BeforeFeatures', (event, cb) => utils.waitForServers(cb));
};


