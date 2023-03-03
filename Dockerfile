FROM node:18.14.2-alpine3.17
RUN addgroup teams
RUN adduser -D -G teams Raj
WORKDIR /app
ENV PORT=5000
ENV FE_ENDPOINT_LINK=http://localhost:5173
ENV DEBUG=*
COPY / /app/
RUN yarn install
RUN yarn run test
RUN yarn run build
RUN yarn run lint
ENTRYPOINT [ "yarn", "run", "dev" ]