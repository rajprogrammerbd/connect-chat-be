import { IMsg } from '../types/IMessage'
import MessageList from './MessageList'
import TypingList from './TypingList'

type ChatType = [string, MessageList, { total: number }][]

abstract class ActiveChatsHash extends TypingList {
  protected chats: ChatType[]

  constructor(size: number) {
    super()

    this.chats = new Array(size)
  }

  protected _hash(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i)
    }
    return hash % this.chats.length
  }

  removeSpecificChat(chatId: string) {
    const index = this._hash(chatId)

    if (!this.chats[index]) {
      return null
    }

    let i = 0
    while (i < this.chats[index].length) {
      if (this.chats[index][i][0] === chatId) {
        break
      }

      i++
    }

    this.chats[index].splice(i, 1)
  }

  setNewMessage(key: string, value: MessageList, joinedCount: number) {
    const index = this._hash(key)

    if (!this.chats[index]) {
      this.chats[index] = []
    }

    this.chats[index].push([key, value, { total: joinedCount }])
  }

  getMessages(chatId: string): IMsg[] | null {
    const index = this._hash(chatId)
    const msg: IMsg[] = []

    if (!this.chats[index]) {
      return null
    }

    for (let i = 0; i < this.chats[index].length; i++) {
      if (this.chats[index][i][0] === chatId) {
        let head = this.chats[index][i][1].head

        while (head) {
          msg.push(head.value as IMsg)

          head = head.next
        }
      }
    }

    const typingMsg = this.allTypingMessages()

    for (let i = 0; i < typingMsg.length; i++) {
      if (typingMsg[i].chatId === chatId) {
        msg.push(typingMsg[i])
      }
    }

    return msg
  }

  findChats(chatId: string): [string, MessageList, { total: number }] | null {
    const index = this._hash(chatId)

    if (!this.chats[index]) {
      return null
    }

    for (let i = 0; i < this.chats[index].length; i++) {
      if (this.chats[index][i][0] === chatId) {
        return this.chats[index][i]
      }
    }

    return null
  }
}

export default ActiveChatsHash
