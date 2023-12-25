// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import { CREATE_USER, FAILED_RESPONSE, SEND_RESPONSE_CREATED_USER } from './helper/actions';
import { CREATE_USER_BODY_TYPE } from './helper/types';
import Data from './Data/Events';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FE_ENDPOINT_LINK
  }
});

const data = new Data();

io.on('connection', (socket) => {
  socket.on(CREATE_USER, async (body: CREATE_USER_BODY_TYPE) => {
    const { email, is_root, username, connection_id } = body;
    // verifying the body object.
    if (!email) {
      socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "Email is required!" });
      return;
    }
    if (is_root === undefined) {
      socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "is_root is required" });
      return;
    }
    if (!username) {
      socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "username is required" });
      return;
    }
    if (connection_id === undefined) {
      socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "connection_id is required" });
      return;
    }

    // add a new user
    try {
      const response = await data.addUser(username, email, is_root, connection_id, socket.id);
      socket.emit(SEND_RESPONSE_CREATED_USER, response);
    } catch (er) {
      socket.emit(FAILED_RESPONSE, er);
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

/*
io.on('connection', (socket) => {
  console.log('connected with some client');
  socket.on('create-user', (username: string, email: string, is_root: boolean, connection_id: null | string) => {
    if (!username) {
      socket.emit('failed-create-user', 'Username is required');
    } else if (!email) {
      socket.emit('failed-create-user', 'Email is required');
    } else if (is_root === undefined) {
      socket.emit('failed-create-user', 'is_root is required');
    } else if (connection_id === undefined) {
      socket.emit('failed-create-user', 'connection_id is required');
    } else {
      const user = data.addUser(username, email, is_root, connection_id);
      console.log(user);
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))


import { dirname } from 'node:path';


d.addUser('Dola1 Dutta','doladutta5r@gmail.com', false, 'def73dd596d9eda12645')
  .then(obj => console.log('result', obj))
  .catch(res => console.error(res))
*/