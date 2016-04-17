/**
 * @fileOverview Utils for building, deploying and then testing ps kata.
 * @name utils.js
 * @author
 * @license BSD 2 Clause
 */

'use strict';

const spawn = require('child_process').spawn,
      http = require('http'),
      async = require('async'),
      fs = require('fs'),
      del = require('del'),
      ncp = require('ncp'),
      git = require('gulp-git'),
      ERRORS = require('./errors');
const debug = console.log.bind(console);

function getDockerTagOrFail (tag) {
  tag = tag || process.env.TAG;
  if (!tag) {
    throw new Error(ERRORS.dockerTagNotSet);
  }
  return tag;
}


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

function runGulpTask (task, cb) {
  const run = spawn('gulp', [task]);
  run.on('exit', (err) => cb(err));
}

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

function runCommand (cmdString, cb) {
  let args = cmdString.split(/\s+/);
  let first = args[0];
  args.shift();
  let run = spawn(first, args);
  printToConsole(run);
  if (cb) run.on('exit', (err) => cb(err));
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

/**
 * Start a new container (docker run + npm start).
 *
 * This is asynchronous with no callback.
 * No attempt is made to check success.
 * @see waitForServer(s) function for checking if a service is up.
 */
function runContainer (repo, tag, name, port) {
  getDockerTagOrFail(tag);
  const dockerCmd = `sudo docker run -d --name=${name} -e NODE_PORT=${port} -p ${port}:${port} ${repo}:${tag} npm start`;
  runCommand(dockerCmd);
}

function buildContainer (repo, tag, dockerfile, cb) {
  getDockerTagOrFail(tag);
  const dockerCmd = `sudo docker build -f ${dockerfile} -t ${repo}:${tag} .`;
  runCommand(dockerCmd, cb);
}

// Delete agent and main server containers.

function deleteContainer (containerName, cb) {
  const dockerCmd = `sudo docker rm -f ${containerName}`;
  runCommand(dockerCmd, cb);
}


/**
 * Checkout and build code for use in docker container.
 *
 * NOTE: this seems to run standalone, but be aware it uses gulp-git
 * so the assumption is that is used within a gulp task.
 *
 * @param {string} giturl - git clone url
 * @param {string} tmpdir - a building area on disk we git clone to
 * @param {string} subdir - a subdir within our project (because we have nested projects in our git repo).
 */
function buildCode (giturl, tmpdir, subdir, cb) {
  const BUILD_SRC = `${tmpdir}/${subdir}`;
  const BUILD_DEST = `./build/${subdir}`;
  if ( !(new RegExp('^/tmp/\\w+')).test(tmpdir) ) {
    throw new Error(`Fail safe: ${tmpdir} should be /tmp/xxx/ or similar.`);
  }
  async.series([
    (cb) => del([tmpdir, BUILD_DEST], { force: true }).then((paths) => cb(), (err) => cb(err)),
    (cb) => git.clone(giturl, { args: tmpdir }, (err) => cb(err) ),
    (cb) => git.checkout('master', { args: '-f', cwd: tmpdir, quiet: false }, (err) => cb(err)),
    (cb) => git.revParse(
      { args: 'master', cwd: tmpdir },
      (hasherr, hash) => fs.writeFile(
        `${BUILD_SRC}/VERSION`,
        hash,
        (err) => {
          if (hasherr) cb(hasherr);
          else cb(err);
        })
    ),
    (cb) => ncp(BUILD_SRC, BUILD_DEST, (err) => cb(err))
  ], (err) => cb(err));
}



module.exports = {
  runCommand: runCommand,
  runGulpTask: runGulpTask,
  waitForServer: waitForServer,

  buildCode: buildCode,
  waitForTestServers: waitForTestServers,

  getDockerTagOrFail: getDockerTagOrFail,
  buildContainer: buildContainer,
  runContainer: runContainer,
  deleteContainer: deleteContainer

};

