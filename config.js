module.exports = {
  GITURL: 'git@github.com:danielbush/ps-kata.git',
  DOCKER: {
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
  }
};
