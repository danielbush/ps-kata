'use strict';

const gulp = require('gulp'),
      spawn = require('child_process').spawn;

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


/**
 * Start a new container (docker run + npm start).
 *
 * This is asynchronous with no callback.
 * No attempt is made to check success.
 * @see waitForServer(s) function for checking if a service is up.
 */
function runContainer (repo, tag, name, port) {
  if (!tag) {
    throw new Error(ERRORS.dockerTagNotSet);
  }
  const dockerCmd = `docker run -i --name=${name} -e NODE_PORT=${port} -p ${port}:${port} ${repo}:${tag} npm start`,
        run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
}

function buildContainer (repo, tag, dockerfile, cb) {
  const dockerCmd = `docker build -f ${dockerfile} -t ${repo}:${tag} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  if (!tag) {
    throw new Error(ERRORS.dockerTagNotSet);
  }
  build.on('close', (err) => cb(err));
  printToConsole(build);
}

// Run end-to-end tests.

gulp.task('test', function (cb) {
  const tag = process.env.TAG;
  if (!tag) {
    throw new Error(ERRORS.dockerTagNotSet);
  }
  const runTests = spawn('node_modules/.bin/cucumberjs', '--require features/step_definitions/'.split(' '));
  runTests.on('close', (err) => cb(err));
  printToConsole(runTests);
});

gulp.task('docker:run', ['docker:run:agent', 'docker:run:main-server']);

gulp.task('docker:run:agent', ['docker:rm:agent'], function () {
  const port = 4000,
        tag = process.env.TAG;
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

gulp.task('docker:build:agent', ['docker:build:base'], function (cb) {
  const tag = process.env.TAG;
  buildContainer(DOCKER.agent.REPO, tag, DOCKER.agent.DOCKERFILE, cb);
});

gulp.task('docker:build:main-server', ['docker:build:base'], function (cb) {
  const tag = process.env.TAG;
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
