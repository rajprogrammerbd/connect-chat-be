import { randomUUID } from 'crypto'
import ActiveChatsHash from './ActiveChats'
import User from './User'
import MessageList from './MessageList'
import { IMsg, Msg_Type, Msg_Types } from '../types/IMessage'
import IUser from '../types/IUser'

class ActiveUsers extends ActiveChatsHash {
  private head: User | null
  private tail: User | null
  private userCount: number

  constructor(size = 53) {
    super(size)

    this.head = null
    this.tail = null
    this.userCount = 0
  }

  returnAllConnectedUser(chatId: string): IUser[] {
    const arr = []

    let current = this.head
    while (current) {
      if (current.value?.chatId === chatId) {
        arr.push(current.value)
      }

      current = current.next
    }

    return arr
  }

  protected userExisted(userId: string, chatId: string): User | null {
    let current = this.head

    while (current) {
      if (current.value?.userId === userId && current.value.chatId === chatId) {
        return current
      }

      current = current.next
    }

    return null
  }

  lookForAdminChatUser(chatId: string): User | null {
    let current = this.head

    while (current) {
      if (current.value?.isAdmin && current.value.chatId === chatId) {
        return current
      }
      current = current.next
    }

    return null
  }

  protected deleteSpecificUser(chatId: string) {
    let res = false

    while (this.head?.value?.chatId === chatId) {
      this.userCount--
      res = true
      const next = this.head.next

      if (next) {
        this.head = next
      } else {
        this.head = null
        this.tail = this.head
      }
    }

    let current = this.head

    while (current) {
      if (current.next !== null && current.next.value?.chatId === chatId) {
        this.userCount--
        res = true
        const next = current.next.next

        if (next) {
          current.next = next
        } else {
          current.next = null
          this.tail = current
        }
      } else {
        current = current.next
      }
    }

    return res
  }

  protected deleteWholeChatBox(chatId: string) {
    this.removeSpecificTypingList(chatId)
    this.removeSpecificChat(chatId)
    this.deleteSpecificUser(chatId)
  }

  removeUser(chatId: string, userId: string) {
    const user = this.userExisted(userId, chatId)

    if (user) {
      if (user.value?.isAdmin) {
        this.multiple_socket_remove(chatId);
        this.deleteWholeChatBox(chatId)
      } else {
        this.removeTypingList(userId)
        
        if (!user.value) return null
        const { userName } = user.value

        if (
          this.head?.value?.userId === userId &&
          this.head.value.chatId === chatId
        ) {
          if (this.head.value.isAdmin) {
            // delete everything.
            this.multiple_socket_remove(chatId);
            this.deleteWholeChatBox(chatId)
          } else {
            const next = this.head.next

            if (next !== null) {
              this.head = next
            } else {
              this.head = null
              this.tail = null
            }
          }
        }

        let current = this.head

        while (current) {
          if (
            current.next?.value?.userId === userId &&
            current.next.value.chatId === chatId
          ) {
            if (current.next.value.isAdmin) {
              // delete everything.
              this.deleteWholeChatBox(chatId)
            } else {
              const next = current.next.next

              if (next !== null) {
                current.next = next
              } else {
                current.next = null
                this.tail = current
              }
            }
          }
          current = current.next
        }

        this.sendMessage(chatId, userId, userName, Msg_Types.removed)
      }
    }

    return null
  }

  allConnectedUserList(chatId: string, userId: string): IUser[] | null {
    const user = this.userExisted(userId, chatId)
    const users: IUser[] = []
    if (user) {
      let current = this.head

      while (current) {
        if (current.value?.chatId === chatId) {
          users.push(current.value)
        }

        current = current.next
      }

      return users
    }

    return null
  }

  startTyping(chatId: string, userId: string) {
    const user = this.userExisted(userId, chatId)
    const chat = this.findChats(chatId)

    if (!user) return null
    if (!chat) return null
    if (user.value === null) return null

    const { userName } = user.value

    const res = this.pushTypingList({
      chatId,
      userId: userId,
      userName: userName,
      type: Msg_Types.typing,
      message: `${userName} is typing`,
      timestamp: new Date().toISOString(),
    })

    return res
  }

  stopTyping(chatId: string, userId: string) {
    const user = this.userExisted(userId, chatId)
    const chat = this.findChats(chatId)

    if (!user) return null
    if (!chat) return null
    if (user.value === null) return null

    const res = this.removeTypingList(userId)

    return res
  }

  sendTextMsg(chatId: string, userId: string, msg: string): boolean {
    const user = this.userExisted(userId, chatId)

    if (user) {
      if (user.value === null) return false
      const { userName } = user.value

      return this.sendMessage(chatId, userId, userName, Msg_Types.msg, msg)
    }

    return false
  }

  protected sendMessage(
    chatId: string,
    userId: string,
    userName: string,
    type: Msg_Type,
    msg?: string
  ): boolean {
    const findChats = this.findChats(chatId)

    if (findChats === null) {
      return false
    }

    const obj: IMsg = {
      type: type,
      message: '',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      chatId,
    }

    if (type === Msg_Types.join) {
      obj.message = `${obj.userName} joined the chat`
      findChats[2].total = findChats[2].total + 1
    } else if (type === Msg_Types.typing) {
      obj.message = `${obj.userName} is typing`
    } else if (type === Msg_Types.removed) {
      obj.message = `${obj.userName} leave the chat`
      findChats[2].total = findChats[2].total - 1
    } else if (type === Msg_Types.started_chat) {
      obj.message = `${obj.userName} started the chat`
    } else if (type === Msg_Types.msg) {
      obj.message = `${msg}`
    }

    const res = findChats[1].pushMsg(obj)

    return res ? true : false
  }

  userAddToExistedChat(name: string, chatId: string, socketId: string): User | null {
    const findAdminUser = this.lookForAdminChatUser(chatId)

    if (!findAdminUser) {
      return null
    }

    const userId = randomUUID()
    const newUser = new User({ userId, chatId, isAdmin: false, userName: name });
    this.sendMessage(chatId, userId, name, Msg_Types.join)

    this.socket_push({ userId, chatId, id: socketId, isAdmin: false });

    newUser.prev = this.tail

    if (this.tail === null) return null

    this.tail.next = newUser
    this.tail = newUser

    this.userCount++

    return this.tail
  }

  adminChatUser(name: string, socketId: string): User | null {
    const userId = randomUUID()
    const chatId = randomUUID()

    const newUser = new User({ userId, chatId, isAdmin: true, userName: name })
    const message = new MessageList()

    this.socket_push({ id: socketId, userId, chatId, isAdmin: true });
    this.setNewMessage(chatId, message, 1)

    if (!this.userCount) {
      this.head = newUser
      this.tail = this.head
      this.userCount = 1

      this.sendMessage(
        chatId,
        userId,
        newUser.value?.userName as string,
        Msg_Types.started_chat
      )

      return this.head
    }

    newUser.prev = this.tail

    if (this.tail === null) return null

    this.tail.next = newUser
    this.tail = newUser

    this.userCount++

    this.sendMessage(
      chatId,
      userId,
      newUser.value?.userName as string,
      Msg_Types.started_chat
    )

    return this.tail
  }

  getAllMessages(userId: string, chatId: string): IMsg[] | null {
    const findUser = this.userExisted(userId, chatId)

    if (!findUser) {
      return null
    }

    const getMsg = this.getMessages(chatId)

    return getMsg
  }

  getSpecificUser(chatId: string, userId: string): IUser | null {
    let current = this.head

    while (current) {
      if (current.value?.chatId === chatId && current.value.userId === userId) {
        return current.value
      }
      current = current.next
    }

    return null
  }
}

export default ActiveUsers
