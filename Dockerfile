ARG NODE_VERSION=18.16.0
ARG ALPINE_VERSION=3.17.2

FROM node:${NODE_VERSION}-alpine AS node

FROM alpine:${ALPINE_VERSION}

RUN apk add --no-cache nodejs

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

RUN node -v

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . . 

RUN npm run build 

EXPOSE 3001

CMD [ "npm", "run", "start:dev" ]