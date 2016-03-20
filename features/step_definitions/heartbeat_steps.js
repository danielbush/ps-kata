'use strict';

module.exports = function () {

  this.Given(/^an agent is running on a target server$/, function (callback) {
    callback.pending();
  });

}
