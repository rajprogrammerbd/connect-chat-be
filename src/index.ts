import dotenv from 'dotenv'
dotenv.config()
// import { v4 as uuidv4 } from 'uuid';
// import UserLinkedList from './Data/users';
// import MessageLinkedList, { IValues } from './Data/messages';
// import { IPreparedDataType, ISocketsId, IUserTyping, IUsersName } from './types';
// import { findTypingIdAvailable } from './helper';
import { Server } from 'socket.io'
import consola from 'consola'
import debug from 'debug'
import cluster from 'node:cluster'
import os from 'os'

const numCPUs = os.cpus().length

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  // Debug logger.
  const port_log = debug('listen:port')
  const PORT = process.env.PORT || 3001

  const io = new Server(PORT as number, {
    cors: {
      origin: [`${process.env.FE_ENDPOINT_LINK}`],
    },
  })

  io.on('connection', socket => {
    socket.send('connected successfully')
  })

  consola.success('Server is running')
  port_log(`Server is running at ws://localhost:${PORT}`)
}
