# https://hub.docker.com/_/node/

FROM ubuntu:14.04
RUN apt-get update -qy
RUN apt-get install -qy curl

RUN mkdir /app
RUN adduser node --home /app --shell /bin/bash
RUN chown node.node /app

USER node
WORKDIR /app

# Needs git and wants to compile
#RUN curl -L http://git.io/n-install | bash
#RUN n 4.4


RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
ENV NVM_DIR="/app/.nvm"
ENV NVM="$NVM_DIR/nvm.sh"
RUN . $NVM && nvm install 4.4
RUN . $NVM && nvm use 4.4
RUN . $NVM && node --version  # should print our version
