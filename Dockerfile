FROM node:14

WORKDIR /usr/src/
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/logs

COPY package.json /usr/src/
RUN npm install
COPY ./app /usr/src/app
COPY ./index.js /usr/src/
COPY ./.env /usr/src/
COPY ./scripts /usr/src/scripts
EXPOSE 8080
CMD [ "npm", "start" ]
