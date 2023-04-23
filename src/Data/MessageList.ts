import MessageNode, { IMsg } from './../types/IMessage'

class MessageList {
  public head: MessageNode | null
  public tail: MessageNode | null

  constructor() {
    this.head = null
    this.tail = null
  }

  pushMsg(msg: IMsg): MessageNode | null {
    const newNode = new MessageNode(msg)

    if (!newNode.value) {
      return null
    }

    if (!this.head) {
      this.head = newNode
      this.tail = newNode

      return this.head
    }

    if (!this.tail) return null
    if (!this.tail.value) return null

    this.tail.next = newNode
    this.tail = newNode

    return this.tail
  }
}

export default MessageList
