import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'socket.io'
import consola from 'consola'
import debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import UserLinkedList from './Data/users'
import MessageLinkedList, { IValues } from './Data/messages'
import { IPreparedDataType, IUsersName } from './types'

// Debug logger.
const port_log = debug('listen:port')
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
  /*
  // Join into a room.
  socket.on('join-room', (room: string) => {
    socket.join(room);
  });
  */

  // Create a new User.
  socket.on('new_user', (name: string) => {
    const msg = new MessageLinkedList()
    const userId = uuidv4()
    const accessId = uuidv4()

    msg.push({
      type: 'user_joined',
      userName: name,
      userId,
      message: `${name} started the chat`,
      timeStamp: new Date(),
    })

    const newUser = user.push(
      {
        accessId: accessId,
        userId,
        userName: name,
        messages: new MessageLinkedList(),
        connectedAccessId: '',
        connectedUserNames: [{ name, userId, connectedAccessId: '' }],
      },
      msg
    )

    const res: IPreparedDataType = {
      connection: true,
      message: 'Connection is successed',
      accessId: accessId,
      connectedAccessId: newUser?.value.connectedAccessId,
      messages: newUser?.value.messages,
      name: newUser?.value.userName,
      userId: newUser?.value.userId,
      userIds: newUser?.value.connectedUserNames,
    }

    socket.join(res.accessId as string)

    socket.emit('receive_new_connection', res)
  })

  // added a existed user
  socket.on('add_new_existed', (name: string, chatID: string) => {
    const isUserExisted = user.find(chatID)
    const userId = uuidv4()
    const accessIdUnique = uuidv4()

    if (isUserExisted) {
      const addNewUser = user.addToAdmin({
        accessId: accessIdUnique,
        userId: userId,
        userName: name,
        connectedAccessId: chatID,
      })

      socket.join(addNewUser.connectedAccessId as string)

      socket.emit('recived_new_existed_user', {
        connection: true,
        message: 'Connection is successed',
        accessId: addNewUser.accessId,
        userId: addNewUser.userId,
        name: addNewUser.name,
        messages: addNewUser.messages,
        userIds: addNewUser.userIds,
        connectedAccessId: addNewUser.connectedAccessId,
      })
    } else {
      socket.emit('failed_response', errorResponseData)
    }
  })

  // Return the data after refresh
  socket.on(
    'retrieve_info_of_refreshed_user',
    (userId: string, accessId: string, connectedAccessId: string) => {
      const res = user.lookForAUser(userId, accessId, connectedAccessId)

      const joined = connectedAccessId === '' ? accessId : connectedAccessId

      socket.join(joined)

      if (res !== false) {
        socket.emit('refreshed_new_existed_user', {
          connection: true,
          message: 'Connection is successed',
          accessId: res.accessId,
          userId: res.userId,
          name: res.userName,
          messages: res.messages,
          userIds: res.connectedUserNames,
          connectedAccessId: res.connectedAccessId,
          connectedUserNames: res.connectedUserNames,
        })
      }
    }
  )

  // Updated connected user.
  socket.on('update-connected-user', (obj: IUsersName, chatID: string) => {
    // Here I need to find the root user and send the message.
    let root = user.head
    while (root) {
      if (root.value.accessId === chatID) {
        break
      }
      root = root.next
    }

    socket.to(chatID).emit('updated-connected-users', obj, root?.value.messages)
  })

  socket.on('send_message', (msg: IValues, accessId: string) => {
    let current = user.head

    while (current) {
      if (current.value.accessId === accessId) {
        current.value.messages?.push(msg)
        break
      }

      current = current.next
    }

    socket.to(accessId).emit('update-all-messages', current?.value.messages)
    // ----------------------------------------------------------
  })
})

consola.success('Server is running')
port_log(`Server is running at http://localhost:${PORT}`)

/*
io.on('connection', socket => {
  const userId = uuidv4();
  const accessIdUnique = uuidv4();

  socket.on('add_new_existed', (name: string, chatID: string) => {
    const isUserExisted = user.find(chatID);
    if (isUserExisted) {
      const addNewUser = user.addToAdmin({
        accessId: accessIdUnique,
        userId: userId,
        userName: name,
        connectedAccessId: chatID
      })

      socket.emit('recived_new_existed_user', {
        connection: true,
        message: 'Connection is successed',
        accessId: addNewUser.accessId,
        userId: addNewUser.userId,
        name: addNewUser.name,
        messages: addNewUser.messages,
        userIds: addNewUser.userIds,
        connectedAccessId: addNewUser.connectedAccessId
      });
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
      connectedAccessId: '',
      connectedUserNames: [{ name, userId, connectedAccessId: '' }],
    })
    const res: IPreparedDataType = {
      connection: true,
      message: 'Connection is successed',
      accessId: socket.id,
      connectedAccessId: newUser?.value.connectedAccessId,
      messages: newUser?.value.messages,
      name: newUser?.value.userName,
      userId: newUser?.value.userId,
      userIds: newUser?.value.connectedUserNames,
    }

    io.emit('receive_new_connection', res)
  })

  socket.on('join-room', (room: string) => {
    console.log('joined room', room);
    socket.join(room);
  })

  socket.on('update-connected-user', (obj: IUsersName, chatID: string) => {
    console.log('existed connection access',  obj.connectedAccessId);
    socket.to(chatID).emit('updated-connected-users', obj)
  });

  socket.on('remove_user', obj => {
    console.log('socket disconnect ', obj)
    // user.removeExistedUser(userId);

    // socket.to(accessId).emit('refresh-user', user);
  })

  socket.on('retrieve_info_of_refreshed_user', (userId: string, accessId: string, connectedAccessId: string) => {
    const res = user.lookForAUser(userId, accessId, connectedAccessId);
    console.log('response ', res);
    if (res !== false) {
      socket.emit('refreshed_new_existed_user', {
        connection: true,
        message: 'Connection is successed',
        accessId: res.accessId,
        userId: res.userId,
        name: res.userName,
        messages: res.messages,
        userIds: res.connectedUserNames,
        connectedAccessId: res.connectedAccessId
      });

      socket.join(accessId);
    }
  });
})

consola.success('Server is running')
port_log(`Server is running at http://localhost:${PORT}`)
*/
