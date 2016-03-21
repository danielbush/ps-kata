const gulp = require('gulp'),
      spawn = require('child_process').spawn;

const IMAGENAME="ps-kata-agent:0.1",
      CONTAINER="ps-kata-agent-1"

function printToConsole (process) {
  process.stdout.on('data', (data) => console.log(data.toString()) );
  process.stderr.on('data', (data) => console.error(data.toString()) );
}

gulp.task('docker:run', ['docker:rm-container', 'docker:build'], function () {
  const cmd = 'cat',
        dockerCmd = `docker run -id --name=${CONTAINER} ${IMAGENAME} bash -lc "${cmd}"`;

  //console.log(dockerCmd);

  const run = spawn('sudo', dockerCmd.split(' '));
  printToConsole(run);
});

gulp.task('docker:rm-container', function (cb) {
  const dockerCmd = `docker rm -f ${CONTAINER}`;
  const kill = spawn('sudo', dockerCmd.split(' '));
  kill.on('close', (err) => cb()); // ignore the error here
  printToConsole(kill);
})

gulp.task('docker:build', function (cb) {
  const dockerCmd = `docker build -t ${IMAGENAME} .`;
  const build = spawn('sudo', dockerCmd.split(' '));
  build.on('close', (err) => cb(err) )
  printToConsole(build);
});




