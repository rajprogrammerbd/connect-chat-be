export type IValues = {
  userName: string
  userId: string
  message: string
  timeStamp: Date
}

class MessageNode {
  public value: IValues
  public next: null | MessageNode
  public prev: null | MessageNode

  constructor(val: IValues) {
    this.value = val
    this.next = null
    this.prev = null
  }
}

class MessageLinkedList {
  public head: null | MessageNode
  public tail: null | MessageNode
  public length: number

  constructor() {
    this.head = null
    this.tail = null
    this.length = 0
  }

  push(val: IValues) {
    const newNode = new MessageNode(val)

    if (this.length === 0) {
      this.head = newNode
      this.tail = newNode
      this.length = 1
      return this
    }

    if (this.tail !== null) {
      this.tail.next = newNode
      this.tail = newNode
      this.length++

      return this
    }
  }
}

export default MessageLinkedList
