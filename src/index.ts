// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import { CREATE_USER, DISCONNECT, FAILED_RESPONSE, SEND_RESPONSE_CREATED_USER } from './helper/actions';
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
  socket.on('hello', (val: string) => {
    socket.emit('world', val);
  });

  // handle disconnection of an user
  socket.on(DISCONNECT, async () => {
    const user = await data.searchUserBySocketId(socket.id);

    if (user) {
      if (user.is_root) {
        // delete the whole chat if the user is admin
        const connection_id = user.connection_id;

        data.removeWholeChat(connection_id);
        socket.leave(socket.id);
      } else {
        await data.removeNonAdminUser(user.email, user.username, user.connection_id, user.is_root, user.socket_id);
      }
    }
  });

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

      if (typeof response.body !== 'string') {
        socket.join(response.body.connection_id);
      }

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
