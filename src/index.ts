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
import ActiveUsers from './Data/ActiveUsers'
import socketFailedRespose from './helper'
import { IResponseUser } from './types'
import { IMsg } from './types/IMessage'

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
  });

  const users = new ActiveUsers();

  io.on('connection', socket => {
    // Add a new user to the chat.
    socket.on('new_user', (name: string) => {
        const newUser = users.adminChatUser(name);

        if (newUser !== null && newUser.value !== null) {
            const { chatId, userId, userName } = newUser.value;

            const connectedUsersList = users.returnAllConnectedUser(chatId);
            const allMessages = users.getAllMessages(userId, chatId);

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
              
                  socket.join(res.chatId);
              
                  socket.emit('receive_new_connection', res)
            } else {
                socketFailedRespose(socket, 'Failed to retrive all messages');
            }
        } else {
            socketFailedRespose(socket, 'Failed to create a new User');
        }
      });

      // Add existed user
      socket.on('add_new_existed', (name: string, chatID: string) => {
        const newUser = users.userAddToExistedChat(name, chatID);

        if (newUser && newUser.value !== null) {
          const { chatId, userId, userName } = newUser.value;

          const connectedUsersList = users.returnAllConnectedUser(chatId);
          const allMessages = users.getAllMessages(userId, chatId);

          socket.join(newUser.value.chatId);

          const res: IResponseUser = {
            connection: true,
            chatId,
            connectedUsersList,
            message: 'Connection is successed',
            messages: allMessages as IMsg[],
            name: userName,
            userId
          };

          socket.to(chatID).emit('add_new_user_update', connectedUsersList, allMessages);
          socket.emit('recived_new_existed_user', res);

        } else {
          socketFailedRespose(socket, 'Failed to connect to the chat');
        }
      });

      socket.on('send_message', (chatId: string, userId: string, msg: string) => {
        const sendTextMsg = users.sendTextMsg(chatId, userId, msg);
        const allMessages = users.getAllMessages(userId, chatId);

        if (sendTextMsg) {
          socket.to(chatId).emit('update-all-messages', allMessages)
        } else {
          socketFailedRespose(socket, 'Failed to send the message');
        }
      });

      socket.on('update-msg-user', (chatId: string, userId: string) => {
        const allMessages = users.getAllMessages(userId, chatId);

        if (allMessages) {
          socket.to(chatId).emit('update-all-messages', allMessages)
        } else {
          socketFailedRespose(socket, 'Failed to get all the messages');
        }
      });

      socket.on('user_typing_message_start',  (chatId: string, userId: string) => {
        users.startTyping(chatId, userId);
        const allMessages = users.getAllMessages(userId, chatId);

        socket.to(chatId).emit('update-all-messages', allMessages);

  })

  socket.on('user_typing_message_stop',  (chatId: string, userId: string) => {
    users.stopTyping(chatId, userId);
    const allMessages = users.getAllMessages(userId, chatId);

    socket.to(chatId).emit('update-all-messages', allMessages);

})

/*
socket.on(
  'retrieve_info_of_refreshed_user',
  (chatId: string, userId: string) => {
    const foundUser = users.getSpecificUser(chatId, userId);

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
  })
  */

  consola.success('Server is running')
  port_log(`Server is running at ws://localhost:${PORT}`)
})
};
