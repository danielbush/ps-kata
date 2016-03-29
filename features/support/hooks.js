'use strict';

const spawn = require('child_process').spawn,
      http = require('http'),
      async = require('async');

const debug = console.log.bind(console);

/**
 * Wait for address:port${path} to return status code of 200.
 *
 * @param {string}   path - a uri path in absolute form eg "/ping".
 * @param {function} cb Callback cb(err), err is passed if we fail to talk to address:port.
 * @param {integer} attemptCount Should only be set by this function when recursing.
 */
function waitForServer (path, address, port, cb, attempts, intervalSecs, attemptCount) {
  attempts = attempts ? attempts : 20;
  intervalSecs = intervalSecs ? intervalSecs : 2;
  attemptCount = attemptCount ? attemptCount : 0;

  const giveUpOrTryAgain = (res) => {
    const addr = `${address}:${port}`;
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

  const req = http.get(`http://localhost:4000${path}`, (res) => {
    if (res.statusCode === 200) {
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


module.exports = function () {
  this.registerHandler('BeforeFeatures', (event, cb) => {
    async.series([
      (cb) => {
        debug('docker:rm START');
        const rmDocker = spawn('gulp', ['docker:rm']);
        rmDocker.stdout.on('data', (data) => console.log(data.toString()) ); // TODO: printToConsole
        rmDocker.stderr.on('data', (data) => console.error(data.toString()) );
        rmDocker.on('close', (err) => cb());
        rmDocker.on('error', (err) => cb(err));
      },
      (cb) => {
        debug('docker:run START');
        const runDocker = spawn('gulp', ['docker:run']);
        runDocker.stdout.on('data', (data) => console.log(data.toString()) ); // TODO: printToConsole
        runDocker.stderr.on('data', (data) => console.error(data.toString()) );
        // Just signal ok, we'll have to poll to determine if servers are running.
        cb();
      },
      (cb) => waitForServer('/ping', 'localhost', 4000, cb), // TODO: hard-coded ports from our gulpfile, need to DRY these
      (cb) => waitForServer('/ping', 'localhost', 4001, cb)
    ], (err, results) => {
      cb(err);
      if (err) throw err; // Cucumber js doesn't really stop well even with error.
    });
  });
};


