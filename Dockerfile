FROM node:4

ENV NPM_CONFIG_LOGLEVEL="warn"
ENV PORT=8000

ADD . /opt/nodeapp/
RUN cd /opt/nodeapp && npm install

WORKDIR /opt/nodeapp
EXPOSE PORT
CMD ["node", "index.js"]
