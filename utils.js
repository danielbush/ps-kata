/**
 * @fileOverview Utils for building, deploying and then testing ps kata.
 * @name utils.js
 * @author
 * @license BSD 2 Clause
 */

'use strict';

const spawn = require('child_process').spawn,
      http = require('http'),
      async = require('async');
const debug = console.log.bind(console);

/**
 * Wait for address:port${path} to return status code of 200.
 *
 * @param {string}   path - a uri path in absolute form eg "/ping".
 * @param {string}   address - scheme + domain eg "http://localhost"
 * @param {function} cb Callback cb(err), err is passed if we fail to talk to address:port.
 * @param {integer}  attemptCount Should only be set by this function when recursing.
 */
function waitForServer (path, address, port, cb, attempts, intervalSecs, attemptCount) {
  attempts = attempts ? attempts : 20;
  intervalSecs = intervalSecs ? intervalSecs : 2;
  attemptCount = attemptCount ? attemptCount : 0;
  const addr = `${address}:${port}${path}`;

  const giveUpOrTryAgain = (res) => {
    const statusCode = res ? res.statusCode : 'No connection';
    debug(`waitForServer: trying again for ${addr}`);
    if (attemptCount >= attempts) {
      console.error(`waitForServer: Can't connect to ${addr} after ${attemptCount} attempts.`);
      cb(new Error(`waitForServer: got http status "${statusCode}" from ${addr}`));
    }
    else {
      setTimeout(
        () => waitForServer(path, address, port, cb, attempts, intervalSecs, attemptCount+1),
        intervalSecs * 1000
      );
    }
  };

  const req = http.get(addr, (res) => {
    if (res.statusCode === 200) {
      debug(`waitForServer: SUCCESS ${addr}`);
      cb();
    }
    else {
      giveUpOrTryAgain(res);
    }
  });

  req.on('error', (err) => {
    // Nothing listening on port.
    giveUpOrTryAgain();
  });
}

/**
 * Start servers and call cb once they're up.
 *
 * This is just a programmatic interface to 'gulp start-test-environment'.
 */
function startAndWaitForServers (cb) {
  const run = spawn('gulp', ['start-test-environment']);
  run.on('close', (err) => cb(err));
}


/**
 * Wait for main server and one agent server on ports we specify.
 *
 * This is for acceptance testing.
 *
 * @param {integer} mainServerPort
 * @param {integer} agentPort
 * @param {function} cb
 */
function waitForTestServers (mainServerPort, agentPort, cb) {
  async.parallel([
    (cb) => waitForServer('/ping', 'http://localhost', mainServerPort, cb),
    (cb) => waitForServer('/ping', 'http://localhost', agentPort, cb)
  ], (err, results) => {
    cb(err);
  });
}

module.exports = {
  waitForServer: waitForServer,
  waitForTestServers: waitForTestServers,
  startAndWaitForServers: startAndWaitForServers
};
