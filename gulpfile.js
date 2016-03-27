
const gulp = require('gulp'),
      spawn = require('child_process').spawn;

const DOCKER = {
  base: {
    DOCKERFILE: 'Dockerfile',
    IMAGENAME: 'ps-kata-base',
    CONTAINER: 'ps-kata-base'
  },
  agent: {
    DOCKERFILE: 'Dockerfile.agent',
    IMAGENAME: 'ps-kata-agent:0.1',
    CONTAINER: 'ps-kata-agent-1'
  }
};

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

gulp.task('docker:run', ['docker:rm-container', 'docker:build'], function () {
  const dockerCmd = `docker run -t --name=${DOCKER.base.CONTAINER} ${DOCKER.base.IMAGENAME} node --version`;
  const run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:run:agent', ['docker:rm-container', 'docker:build:agent'], function () {
  const port = 4000,
        dockerCmd = `docker run -i --name=${DOCKER.agent.CONTAINER} -e NODE_PORT=${port} -p ${port}:${port} ${DOCKER.agent.IMAGENAME} npm start`,
        run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:rm-container', function (cb) {
  const dockerCmd = `docker rm -f ${DOCKER.agent.CONTAINER}`;
  const kill = spawn('sudo', dockerCmd.split(' '));
  kill.on('close', (err) => cb()); // ignore the error here
  printToConsole(kill);
});

gulp.task('docker:build', function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.base.DOCKERFILE} -t ${DOCKER.base.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
});

gulp.task('docker:build:agent', ['docker:build'], function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.agent.DOCKERFILE} -t ${DOCKER.agent.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) );
  printToConsole(build);
});




