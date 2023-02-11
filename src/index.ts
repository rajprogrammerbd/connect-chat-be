import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'socket.io'
import consola from 'consola'
import debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import UserLinkedList from './Data/users'
import MessageLinkedList from './Data/messages'
import { IPreparedDataType, IUsersName } from './types'

// Debug logger.
const port_log = debug('listen:port')

// const httpServer = createServer(app);
const PORT = process.env.PORT || 3001

const io = new Server(PORT as number, {
  cors: {
    origin: [`${process.env.FE_ENDPOINT_LINK}`],
  },
})

const errorResponseData = {
  connection: false,
  message: 'Failed to connect (Invalid request)',
}

const user = new UserLinkedList()

io.on('connection', socket => {
  const userId = uuidv4()

  socket.on('add_new_existed', (name: string, chatID: string) => {
    const isUserExisted = user.find(chatID)
    if (isUserExisted) {
      const addNewUser = user.addToAdmin({
        accessId: chatID,
        userId: userId,
        userName: name,
      })

      socket.emit('recived_new_existed_user', {
        connection: true,
        message: 'Connection is successed',
        accessId: addNewUser.accessId,
        userId: addNewUser.userId,
        name: addNewUser.name,
        messages: addNewUser.messages,
        userIds: addNewUser.userIds,
      })
    } else {
      socket.emit('failed_response', errorResponseData)
    }
  })

  socket.on('new_user', (name: string) => {
    const newUser = user.push({
      accessId: socket.id,
      userId,
      userName: name,
      messages: new MessageLinkedList(),
      connectedUserNames: [{ name, userId }],
    })
    const res: IPreparedDataType = {
      connection: true,
      message: 'Connection is successed',
      accessId: socket.id,
      messages: newUser?.value.messages,
      name: newUser?.value.userName,
      userId: newUser?.value.userId,
      userIds: newUser?.value.connectedUserNames,
    }

    io.emit('receive_new_connection', res)
  })

  socket.on('join-room', (room: string) => {
    socket.join(room)
  })

  socket.on('update-connected-user', (obj: IUsersName, chatID: string) => {
    socket.to(chatID).emit('updated-connected-users', obj)
  })

  socket.on('remove_user', obj => {
    console.log('socket disconnect ', obj)
    // user.removeExistedUser(userId);

    // socket.to(accessId).emit('refresh-user', user);
  })
})

consola.success('Server is running')
port_log(`Server is running at http://localhost:${PORT}`)
