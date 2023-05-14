/*
import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'socket.io'
import consola from 'consola'
import debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import UserLinkedList from './Data/users'
import MessageLinkedList, { IValues } from './Data/messages'
import { IPreparedDataType, ISocketsId, IUserTyping, IUsersName } from './types'
import { findTypingIdAvailable } from './helper'

// Debug logger.
const port_log = debug('listen:port')
const PORT = process.env.PORT || 3001

const io = new Server(PORT as number, {
  cors: {
    origin: [`${process.env.FE_ENDPOINT_LINK}`],
  },
})

let user = new UserLinkedList()
const listOfSockets: ISocketsId[] = []

io.on('connection', socket => {
  // Create a new User.
  socket.on('new_user', (name: string) => {
    const msg = new MessageLinkedList()
    const userId = uuidv4()
    const accessId = uuidv4()

    listOfSockets.push({ id: socket.id, userId: userId, accessId })

    msg.pushMsg({
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

      listOfSockets.push({ id: socket.id, userId: userId, accessId: chatID })
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
      socket.emit('failed_response', {
        connection: false,
        message: 'Chat connection not found',
      })
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

  socket.on(
    'user_typing_message_status',
    (obj: IUserTyping, userId: string, accessId: string, userName: string) => {
      let current = user.head

      while (current) {
        if (current.value.accessId === accessId) {
          const find = findTypingIdAvailable(
            { typingId: obj.id },
            current.value.messages as MessageLinkedList
          )

          if (obj.status) {
            if (!find) {
              current.value.messages?.pushMsg({
                type: 'typing',
                message: `${userName} is typing`,
                timeStamp: new Date(),
                userId,
                userName,
                typingId: obj.id,
              })
            }
          } else {
            if (find) {
              // Here I need to write the implementation of removing the message element.
              const newMessage = new MessageLinkedList()

              let currentMsg = current?.value?.messages?.head
              while (currentMsg) {
                if (currentMsg.value.typingId !== obj.id) {
                  newMessage.pushMsg(currentMsg.value)
                }
                currentMsg = currentMsg.next
              }

              current.value.messages = newMessage
            }
          }

          break
        }

        current = current.next
      }

      socket
        .to(accessId)
        .emit('responding-typing-message', current?.value.messages)
    }
  )

  // Sending a message to all the connected user to a perticular room.
  socket.on('send_message', (msg: IValues, accessId: string) => {
    let current = user.head

    while (current) {
      if (current.value.accessId === accessId) {
        current.value.messages?.pushMsg(msg)
        break
      }

      current = current.next
    }

    socket.to(accessId).emit('update-all-messages', current?.value.messages)
    // ----------------------------------------------------------
  })

  // This connection is for who refreshed and got a new socket id.
  socket.on('change_socket_oldId', (oldSocketId: string) => {
    const findIndex = listOfSockets.findIndex(
      (o: ISocketsId) => o.id === oldSocketId
    )

    if (findIndex !== -1) {
      listOfSockets[findIndex].id = socket.id
    }
  })

  socket.on('disconnect', () => {
    const foundIdArr = listOfSockets.filter(
      (o: ISocketsId) => o.id === socket.id
    )

    if (foundIdArr.length === 1) {
      const isUserAvailable = user.isUserAvailable(foundIdArr[0].userId)

      // If we find a user.
      if (isUserAvailable) {
        const isUserAdmin = user.isUserAdmin(
          foundIdArr[0].userId,
          foundIdArr[0].accessId
        )

        if (isUserAdmin) {
          const connectedUserList = isUserAdmin.connectedUserNames

          if (connectedUserList !== undefined) {
            for (let i = 0; i < connectedUserList.length; i++) {
              const myNewUser = new UserLinkedList()
              let myCurrent = user.head

              while (myCurrent) {
                if (myCurrent.value.userId !== connectedUserList[i].userId) {
                  myNewUser.push(myCurrent.value)
                }

                myCurrent = myCurrent.next
              }

              user = myNewUser
            }

            socket
              .to(foundIdArr[0].accessId)
              .emit('admin_closed', { message: 'Admin user closed the chat' })
            return
          }
        }

        let current = user.head
        const { userId, userName } = isUserAvailable

        while (current) {
          // Add a message
          if (current.value.accessId === foundIdArr[0].accessId) {
            const idx = current.value.connectedUserNames?.findIndex(
              (val: IUsersName) => val.userId === foundIdArr[0].userId
            )
            current.value.connectedUserNames?.splice(idx as number, 1)
            current.value.messages?.pushMsg({
              userId,
              message: `${userName} has left the chat`,
              timeStamp: new Date(),
              type: 'user_removed',
              userName,
            })
            break
          }

          current = current.next
        }

        let present = user.head
        const newUser = new UserLinkedList()

        while (present) {
          if (present.value.userId !== foundIdArr[0].userId) {
            newUser.push(present.value)
          }
          present = present.next
        }

        user = newUser

        const findIndex = listOfSockets.findIndex(
          (o: ISocketsId) => o.id === socket.id
        )
        listOfSockets.splice(findIndex, 1)

        socket.emit(
          'update-message-connectedUser',
          current?.value.messages,
          current?.value.connectedUserNames
        )

        socket
          .to(foundIdArr[0].accessId)
          .emit(
            'update-message-connectedUser',
            current?.value.messages,
            current?.value.connectedUserNames
          )
      }
    }
  })
})

consola.success('Server is running')
port_log(`Server is running at http://localhost:${PORT}`)
*/
