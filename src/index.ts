import dotenv from 'dotenv'
dotenv.config()
import cluster from 'cluster'
import os from 'os'
import { Server } from 'socket.io'
import consola from 'consola'
import debug from 'debug'
import ActiveUsers from './Data/ActiveUsers'
import socketFailedRespose from './helper'
import { IResponseUser } from './types'
import { IMsg } from './types/IMessage'
import { createServer } from 'http'

if (cluster.isPrimary) {
  const cpus = os.cpus()

  for (let i = 0; i < cpus.length; i++) {
    cluster.fork()
  }

  cluster.on('online', worker => {
    consola.success(
      `Worker ID is ${worker.id} and PID is ${worker.process.pid}`
    )
  })

  cluster.on('exit', worker => {
    consola.warn(
      `Worker ID ${worker.id} and PID is ${worker.process.pid} is offline`
    )

    consola.info("Let's fork new worker")
  })
} else {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: [`${process.env.FE_ENDPOINT_LINK}`],
    },
  })

  const users = new ActiveUsers()

  io.on('connection', socket => {
    // Add a new user to the chat.
    socket.on('new_user', (name: string) => {
      const newUser = users.adminChatUser(name, socket.id)

      if (newUser !== null && newUser.value !== null) {
        const { chatId, userId, userName } = newUser.value

        const connectedUsersList = users.returnAllConnectedUser(chatId)
        const allMessages = users.getAllMessages(userId, chatId)

        if (allMessages) {
          const res: IResponseUser = {
            connection: true,
            message: 'Connection is successed',
            chatId,
            connectedUsersList,
            messages: allMessages,
            name: userName,
            userId,
          }

          socket.join(res.chatId)
          socket.emit('receive_new_connection', res)
        } else {
          socketFailedRespose(socket, 'Failed to retrive all messages')
        }
      } else {
        socketFailedRespose(socket, 'Failed to create a new User')
      }
    })

    socket.on(
      'refreshed_user',
      (chatId: string, userId: string, name: string) => {
        const findSocket = users.findSocketByChatId(chatId, userId)

        if (!findSocket) {
          const adminUser = users.lookForAdminChatUser(chatId)

          if (adminUser) {
            const newUser = users.userAddToExistedChat(name, chatId, socket.id)

            if (newUser && newUser.value !== null) {
              const { chatId, userId, userName } = newUser.value

              const connectedUsersList = users.returnAllConnectedUser(chatId)
              const allMessages = users.getAllMessages(userId, chatId)

              socket.join(newUser.value.chatId)

              const res: IResponseUser = {
                connection: true,
                chatId,
                connectedUsersList,
                message: 'Connection is successed',
                messages: allMessages as IMsg[],
                name: userName,
                userId,
              }

              socket
                .to(chatId)
                .emit('add_new_user_update', connectedUsersList, allMessages)

              socket.emit('recived_new_existed_user', res)
            } else {
              socketFailedRespose(socket, 'Failed to create new user')
            }
          }
        }
      }
    )

    // Add existed user
    socket.on('add_new_existed', (name: string, chatID: string) => {
      const newUser = users.userAddToExistedChat(name, chatID, socket.id)

      if (newUser && newUser.value !== null) {
        const { chatId, userId, userName } = newUser.value

        const connectedUsersList = users.returnAllConnectedUser(chatId)
        const allMessages = users.getAllMessages(userId, chatId)

        socket.join(newUser.value.chatId)

        const res: IResponseUser = {
          connection: true,
          chatId,
          connectedUsersList,
          message: 'Connection is successed',
          messages: allMessages as IMsg[],
          name: userName,
          userId,
        }

        socket
          .to(chatID)
          .emit('add_new_user_update', connectedUsersList, allMessages)

        socket.emit('recived_new_existed_user', res)
      } else {
        socketFailedRespose(socket, 'Failed to connect to the chat')
      }
    })

    socket.on('send_message', (chatId: string, userId: string, msg: string) => {
      const sendTextMsg = users.sendTextMsg(chatId, userId, msg)
      const allMessages = users.getAllMessages(userId, chatId)

      if (sendTextMsg) {
        socket.to(chatId).emit('update-all-messages', allMessages)
      } else {
        socketFailedRespose(socket, 'Failed to send the message')
      }
    })

    socket.on('update-msg-user', (chatId: string, userId: string) => {
      const allMessages = users.getAllMessages(userId, chatId)

      if (allMessages) {
        socket.to(chatId).emit('update-all-messages', allMessages)
      } else {
        socketFailedRespose(socket, 'Failed to get all the messages')
      }
    })

    socket.on('user_typing_message_start', (chatId: string, userId: string) => {
      users.startTyping(chatId, userId)
      const allMessages = users.getAllMessages(userId, chatId)

      socket.to(chatId).emit('update-all-messages', allMessages)
    })

    socket.on('user_typing_message_stop', (chatId: string, userId: string) => {
      users.stopTyping(chatId, userId)
      const allMessages = users.getAllMessages(userId, chatId)

      socket.to(chatId).emit('update-all-messages', allMessages)
    })

    socket.on('disconnect', () => {
      const result = users.findSocketId(socket.id)

      if (result) {
        if (result.isAdmin) {
          socket.to(result.chatId).emit('admin-closed')
          users.removeUser(result.chatId, result.userId)
          console.log('done testing', users)
        } else {
          users.removeUser(result.chatId, result.userId)
          users.single_socket_remove(result.userId)

          const connectedUsersList = users.returnAllConnectedUser(result.chatId)
          const allMessages = users.getMessages(result.chatId)

          socket
            .to(result.chatId)
            .emit('add_new_user_update', connectedUsersList, allMessages)
        }
      }
    })
  })

  // Debug logger.
  const port_log = debug('listen:port')
  const PORT = process.env.PORT || 3001

  httpServer.listen(PORT)

  consola.success(
    `Server is running with worker PID ${cluster.worker?.process.pid}`
  )
  port_log(`Server is running at ws://localhost:${PORT}`)
}
