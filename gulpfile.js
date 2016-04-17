'use strict';

const gulp = require('gulp'),
      spawn = require('child_process').spawn,
      config = require('./config'),
      utils = require('./utils'),
      runSequence = require('run-sequence');

// --------------------------------------------------------------------------------
// Main tasks

gulp.task('build', function (cb) {
  runSequence(
    ['build:agent', 'build:main-server'],
    ['docker:build:agent', 'docker:build:main-server'],
    cb
  );
});

// Run end-to-end tests.
gulp.task('test:cucumber', function (cb) {
  const tag = utils.getDockerTagOrFail();
  utils.runCommand('node_modules/.bin/cucumberjs --require features/step_definitions/', cb);
});

// Start environment suitable for acceptance testing.
gulp.task('test:start-environment', ['docker:run', 'test:wait-for-servers']);

gulp.task('docker:run', ['docker:run:agent', 'docker:run:main-server']);

gulp.task('docker:run:agent', ['docker:rm:agent'], function () {
  const port = config.TEST.agent.port,
        tag = utils.getDockerTagOrFail();
  utils.runContainer(config.DOCKER.agent.REPO, tag, config.DOCKER.agent.CONTAINER, port);
});

gulp.task('docker:run:main-server', ['docker:rm:main-server'], function () {
  const port = config.TEST.mainServer.port,
        tag = process.env.TAG;
  utils.runContainer(config.DOCKER.mainServer.REPO, tag, config.DOCKER.mainServer.CONTAINER, port);
});

// --------------------------------------------------------------------------------
// Supporting tasks

gulp.task('docker:build:base', function (cb) {
  const dockerCmd = `sudo docker build -f ${config.DOCKER.base.DOCKERFILE} -t ${config.DOCKER.base.IMAGENAME} .`;
  utils.runCommand(dockerCmd, cb);
});


gulp.task('test:wait-for-servers', function (cb) {
  utils.waitForTestServers(config.TEST.mainServer.port, config.TEST.agent.port, cb);
});

gulp.task('build:agent', function (cb) {
  utils.buildCode(config.GITURL, '/tmp/build/agent', 'ps-agent', cb);
});

gulp.task('build:main-server', function (cb) {
  utils.buildCode(config.GITURL, '/tmp/build/main-server', 'main-server', cb);
});

gulp.task('docker:build:agent', ['docker:build:base'], function (cb) {
  // NOTE: Dockerfile looks for build/ps-agent made by build:agent; requires build:agent
  const tag = utils.getDockerTagOrFail();
  utils.buildContainer(config.DOCKER.agent.REPO, tag, config.DOCKER.agent.DOCKERFILE, cb);
});

gulp.task('docker:build:main-server', ['docker:build:base'], function (cb) {
  const tag = utils.getDockerTagOrFail();
  utils.buildContainer(config.DOCKER.mainServer.REPO, tag, config.DOCKER.mainServer.DOCKERFILE, cb);
});

gulp.task('docker:rm', ['docker:rm:agent', 'docker:rm:main-server']);

gulp.task('docker:rm:agent', function (cb) {
  utils.deleteContainer(config.DOCKER.agent.CONTAINER, cb);
});

gulp.task('docker:rm:main-server', function (cb) {
  utils.deleteContainer(config.DOCKER.mainServer.CONTAINER, cb);
});

