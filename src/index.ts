// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FE_ENDPOINT_LINK
  }
});

io.on('connection', () => {
  console.log('someone is connected');
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