'use strict';

const utils = require('../../utils');

module.exports = function () {
  // A gulp task should set up the environment and invoke cucumber.  We just check for it here.
  // TODO: we may want to control starting and stopping the environment.
  this.registerHandler('BeforeFeatures',
                       (event, cb) => utils.runGulpTask('test:start-environment', cb));
};


