### STAGE 1: Build ###
FROM node:alpine as build
RUN apk add --no-cache git
WORKDIR '/app'
ENV PATH ./node_modules/.bin:$PATH
COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .
ARG arg_env=docker
ENV docker_env=${arg_env}
ARG arg_sha=none
ENV docker_sha=${arg_sha}
ENV BUGSNAG_APIKEY=YOURBUGSNAGAPIKEY
RUN npm run build

### STAGE 2: Production Environment ###
FROM node:alpine
WORKDIR '/app'
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=build /app/ssl /app/ssl
COPY --from=build /app/src/server /app/src/server
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public
ARG arg_env=docker
ENV docker_env=${arg_env}
ARG arg_sha=none
ENV docker_sha=${arg_sha}
EXPOSE 8080
CMD [ "node", "./src/server/index.js" ]
