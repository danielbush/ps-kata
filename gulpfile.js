const gulp = require('gulp'),
      spawn = require('child_process').spawn;

const DOCKER = {
  base: {
    IMAGENAME: "ps-kata-base",
    CONTAINER: "ps-kata-base"
  },
  agent: {
    DOCKERFILE: "Dockerfile.agent",
    IMAGENAME: "ps-kata-agent:0.1",
    CONTAINER: "ps-kata-agent-1"
  }
}

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

gulp.task('docker:run', ['docker:rm-container', 'docker:build'], function () {
  const cmd = 'cat',
        dockerCmd = `docker run -id --name=${DOCKER.base.CONTAINER} ${DOCKER.base.IMAGENAME} bash -lc "${cmd}"`;
  const run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:run:agent', ['docker:rm-container', 'docker:build'], function () {
  const cmd = 'cat',
        dockerCmd = `docker run -id --name=${DOCKER.agent.CONTAINER} ${DOCKER.agent.IMAGENAME} bash -lc "${cmd}"`;
  const run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:rm-container', function (cb) {
  const dockerCmd = `docker rm -f ${DOCKER.agent.CONTAINER}`;
  const kill = spawn('sudo', dockerCmd.split(' '));
  kill.on('close', (err) => cb()); // ignore the error here
  printToConsole(kill);
})

gulp.task('docker:build', function (cb) {
  const dockerCmd = `docker build -t ${DOCKER.base.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) )
  printToConsole(build);
});

gulp.task('docker:build:agent', ['docker:build'], function (cb) {
  const dockerCmd = `docker build -f ${DOCKER.agent.DOCKERFILE} -t ${DOCKER.agent.IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) )
  printToConsole(build);
});




