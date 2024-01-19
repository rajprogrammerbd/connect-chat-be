// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import cluster from 'node:cluster';
import os from "node:os";
import express from 'express';
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import Data from './Data/Events';
import creationHandler from "./Handlers/creation-user";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import deletionReconnection from './Handlers/deletion-reconnect';

const cpus = os.cpus();
const environment = process.env.NODE_ENV;

if (environment === "production") {
  runCluster();
} else {
  app();
}

function runCluster() {
  if (cluster.isPrimary) {
    for (let i = 0; i < cpus.length; i++) {
      cluster.fork();
    }
  
    cluster.on('disconnect', () => {
      cluster.fork();
    });
  } else {
    app();
  }  
}

function app() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FE_ENDPOINT_LINK
    },
  });
  
  const data = new Data();

  const onConnection = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>) => {
    creationHandler(io, socket, data);
    deletionReconnection(io, socket, data);
  }

  io.on("connection", onConnection);
  
  const PORT = process.env.PORT || 4000;
  
  server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });
}
