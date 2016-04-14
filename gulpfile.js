'use strict';

const gulp = require('gulp'),
      spawn = require('child_process').spawn,
      git = require('gulp-git'),
      utils = require('./utils');

const DOCKER = {
  base: {
    DOCKERFILE: 'Dockerfile.base',
    IMAGENAME: 'ps-kata-base',
    CONTAINER: 'ps-kata-base'
  },
  agent: {
    DOCKERFILE: 'Dockerfile.agent',
    IMAGENAME: 'ps-kata-agent:0.1',
    REPO: 'ps-kata-agent',
    CONTAINER: 'ps-kata-agent-1'
  },
  mainServer: {
    DOCKERFILE: 'Dockerfile.main-server',
    IMAGENAME: 'ps-kata-main-server:0.1',
    REPO: 'ps-kata-main-server',
    CONTAINER: 'ps-kata-main-server-1'
  }
};

const ERRORS = {
  dockerTagNotSet: 'Docker image TAG not specified.  TAG=xyz gulp ...'
};

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

function getTagOrFail (tag) {
  tag = tag || process.env.TAG;
  if (!tag) {
    throw new Error(ERRORS.dockerTagNotSet);
  }
  return tag;
}

/**
 * Start a new container (docker run + npm start).
 *
 * This is asynchronous with no callback.
 * No attempt is made to check success.
 * @see waitForServer(s) function for checking if a service is up.
 */
function runContainer (repo, tag, name, port) {
  getTagOrFail(tag);
  const dockerCmd = `docker run -d --name=${name} -e NODE_PORT=${port} -p ${port}:${port} ${repo}:${tag} npm start`,
        run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
}

function buildContainer (repo, tag, dockerfile, cb) {
  const dockerCmd = `docker build -f ${dockerfile} -t ${repo}:${tag} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  getTagOrFail(tag);
  build.on('close', (err) => cb(err));
  printToConsole(build);
}

// Run end-to-end tests.

gulp.task('test:cucumber', function (cb) {
  const tag = getTagOrFail();
  const runTests = spawn('node_modules/.bin/cucumberjs', '--require features/step_definitions/'.split(' '));
  runTests.on('close', (err) => cb(err));
  printToConsole(runTests);
});

gulp.task('docker:run', ['docker:run:agent', 'docker:run:main-server']);

gulp.task('docker:run:agent', ['docker:rm:agent'], function () {
  const port = 4000,
        tag = getTagOrFail();
  runContainer(DOCKER.agent.REPO, tag, DOCKER.agent.CONTAINER, port);
});

gulp.task('docker:run:main-server', ['docker:rm:main-server'], function () {
  const port = 4001,
        tag = process.env.TAG;
  runContainer(DOCKER.mainServer.REPO, tag, DOCKER.mainServer.CONTAINER, port);
});

gulp.task('docker:build:base', function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.base.DOCKERFILE} -t ${DOCKER.base.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
});

const GITURL = 'git@github.com:danielbush/ps-kata.git';
const async = require('async'),
      del = require('del'),
      ncp = require('ncp'),
      fs = require('fs'),
      runSequence = require('run-sequence');

gulp.task('build', function (cb) {
  runSequence(
    ['build:agent', 'build:main-server'],
    ['docker:build:agent', 'docker:build:main-server'],
    cb
  );
});

// Start environment suitable for acceptance testing.

gulp.task('start-test-environment', ['docker:run', 'wait-for-test-servers']);

gulp.task('wait-for-test-servers', function (cb) {
  utils.waitForTestServers(4000, 4001, cb);
});

/**
 * Checkout and build code for use in docker container.
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

gulp.task('build:agent', function (cb) {
  buildCode(GITURL, '/tmp/build/agent', 'ps-agent', cb);
});

gulp.task('build:main-server', function (cb) {
  buildCode(GITURL, '/tmp/build/main-server', 'main-server', cb);
});

gulp.task('docker:build:agent', ['docker:build:base'], function (cb) {
  const tag = getTagOrFail();
  buildContainer(DOCKER.agent.REPO, tag, DOCKER.agent.DOCKERFILE, cb);
});

gulp.task('docker:build:main-server', ['docker:build:base'], function (cb) {
  const tag = getTagOrFail();
  buildContainer(DOCKER.mainServer.REPO, tag, DOCKER.mainServer.DOCKERFILE, cb);
});

// Delete agent and main server containers.

function deleteContainer (containerName, cb) {
  const dockerCmd = `docker rm -f ${containerName}`;
  const kill = spawn('sudo', dockerCmd.split(' '));
  kill.on('close', (err) => cb()); // ignore the error here
  printToConsole(kill);
}

gulp.task('docker:rm', ['docker:rm:agent', 'docker:rm:main-server']);

gulp.task('docker:rm:agent', function (cb) {
  deleteContainer(DOCKER.agent.CONTAINER, cb);
});

gulp.task('docker:rm:main-server', function (cb) {
  deleteContainer(DOCKER.mainServer.CONTAINER, cb);
});
