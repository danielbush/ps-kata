
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
    CONTAINER: 'ps-kata-agent-1'
  },
  mainServer: {
    DOCKERFILE: 'Dockerfile.main-server',
    IMAGENAME: 'ps-kata-main-server:0.1',
    CONTAINER: 'ps-kata-main-server-1'
  }
};

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

gulp.task('docker:run', ['docker:run:agent', 'docker:run:main-server']);

gulp.task('docker:run:agent', ['docker:rm:agent', 'docker:build:agent'], function () {
  const port = 4000,
        dockerCmd = `docker run -i --name=${DOCKER.agent.CONTAINER} -e NODE_PORT=${port} -p ${port}:${port} ${DOCKER.agent.IMAGENAME} npm start`,
        run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:run:main-server', ['docker:rm:main-server', 'docker:build:main-server'], function () {
  const port = 4001,
        dockerCmd = `docker run -i --name=${DOCKER.mainServer.CONTAINER} -e NODE_PORT=${port} -p ${port}:${port} ${DOCKER.mainServer.IMAGENAME} npm start`,
        run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:build:base', function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.base.DOCKERFILE} -t ${DOCKER.base.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
});

gulp.task('docker:build:agent', ['docker:build:base'], function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.agent.DOCKERFILE} -t ${DOCKER.agent.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
});

gulp.task('docker:build:main-server', ['docker:build:base'], function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.mainServer.DOCKERFILE} -t ${DOCKER.mainServer.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
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
