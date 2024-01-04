FROM node:21-alpine3.18
WORKDIR /app
COPY / .
ENV FE_ENDPOINT_LINK="http://localhost:8000"
ENV DATABASE_URL="mongodb://localhost:27017"
ENV PORT=4000
ENV DEBUG=*
RUN yarn install
EXPOSE 4000
CMD ["yarn", "run", "dev"]
