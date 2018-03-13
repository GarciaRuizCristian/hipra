FROM node:boron
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/platforms/browser/www
WORKDIR /usr/src/app
COPY node_server/. /usr/src/app
COPY platforms/browser/www/. /usr/src/platforms/browser/www
CMD [ "npm", "start", "https://server-mf80-dev.eu-gb.mybluemix.net"]

EXPOSE 80