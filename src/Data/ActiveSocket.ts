import ISockets from '../types/ISockets'

type IRes = {
  userId: string
  chatId: string
  isAdmin: boolean
}

class NodeSocket {
  public value: ISockets
  public next: NodeSocket | null

  constructor(val: ISockets) {
    this.value = val
    this.next = null
  }
}

class ActiveSockets {
  private socket_head: NodeSocket | null
  private socket_tail: NodeSocket | null

  constructor() {
    this.socket_head = null
    this.socket_tail = null
  }

  multiple_socket_remove(chatId: string): boolean {
    let res = false

    while (this.socket_head?.value.chatId === chatId) {
      res = true
      const next = this.socket_head.next

      if (next) {
        this.socket_head = next
      } else {
        this.socket_head = null
        this.socket_tail = this.socket_head
      }
    }

    let current = this.socket_head

    while (current) {
      if (current.next !== null && current.next.value?.chatId === chatId) {
        res = true
        const next = current.next.next

        if (next) {
          current.next = next
        } else {
          current.next = null
          this.socket_tail = current
        }
      } else {
        current = current.next
      }
    }

    return res
  }

  findSocketByChatId(chatId: string, userId: string): ISockets | null {
    let current = this.socket_head

    while (current) {
      if (current.value.chatId === chatId && current.value.userId === userId) {
        return current.value
      }

      current = current.next
    }

    return null
  }

  findSocketId(socketId: string): IRes | null {
    let current = this.socket_head
    while (current) {
      const { chatId, id, userId, isAdmin } = current.value

      if (id === socketId) {
        return { userId, chatId, isAdmin }
      }

      current = current.next
    }

    return null
  }

  single_socket_remove(userId: string): boolean {
    let res = false

    while (this.socket_head?.value.userId === userId) {
      res = true
      const next = this.socket_head.next

      if (next) {
        this.socket_head = next
      } else {
        this.socket_head = null
        this.socket_tail = this.socket_head
      }
    }

    let current = this.socket_head

    while (current) {
      if (current.next !== null && current.next.value?.userId === userId) {
        res = true
        const next = current.next.next

        if (next) {
          current.next = next
        } else {
          current.next = null
          this.socket_tail = current
        }
      } else {
        current = current.next
      }
    }

    return res
  }

  socket_push(val: ISockets): NodeSocket {
    const newNode = new NodeSocket(val)

    if (this.socket_head === null) {
      this.socket_head = newNode
      this.socket_tail = newNode
    } else {
      if (this.socket_tail !== null) {
        this.socket_tail.next = newNode
        this.socket_tail = newNode
      }
    }

    return newNode
  }
}

export default ActiveSockets
