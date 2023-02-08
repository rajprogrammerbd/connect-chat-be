import MessageLinkedList from './messages'

export type IValues = {
  userName: string
  userId: string
  accessId: string
  connectedUserNames?: string[]
  messages?: MessageLinkedList
}

class UserNode {
  public value: IValues
  public next: null | UserNode
  public prev: null | UserNode

  constructor(val: IValues) {
    this.value = val
    this.next = null
    this.prev = null
  }
}

class UserLinkedList {
  public head: null | UserNode
  public tail: null | UserNode
  public length: number

  constructor() {
    this.head = null
    this.tail = null
    this.length = 0
  }

  push(val: IValues) {
    const newNode = new UserNode(val)

    if (this.length === 0) {
      this.head = newNode
      this.tail = newNode
      this.length = 1
      return newNode
    }

    if (this.tail !== null) {
      this.tail.next = newNode
      this.tail = newNode
      this.length++

      return newNode
    }
  }
}

export default UserLinkedList
