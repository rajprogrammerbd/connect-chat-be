import { IUsersName } from '../types'
import MessageLinkedList from './messages'

export type IValues = {
  userName: string
  userId: string
  accessId?: string
  connectedAccessId?: string
  connectedUserNames?: IUsersName[]
  messages?: MessageLinkedList
}

type IAddToExistedUser = {
  accessId: string | undefined
  userIds: IUsersName[]
  messages: MessageLinkedList | undefined
  name: string | undefined
  userId: string | undefined
  connectedAccessId: string | undefined
}

export class UserNode {
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

  push(val: IValues, msg?: MessageLinkedList) {
    const newNode = new UserNode(val)

    if (msg) {
      newNode.value.messages = msg
    }

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

  lookForAUser(
    userId: string,
    accessId: string,
    connectedAccessId: string
  ): IValues | false {
    let current = this.head
    while (current) {
      if (
        current.value.userId === userId &&
        current.value.accessId === accessId &&
        current.value.connectedAccessId === connectedAccessId
      ) {
        if (current.value.messages === undefined) {
          let look = this.head

          while (look) {
            if (look.value.accessId === connectedAccessId) {
              break
            }
            look = look.next
          }

          return {
            ...current.value,
            messages: look?.value.messages,
            connectedUserNames: look?.value.connectedUserNames,
          }
        } else {
          return current.value
        }
      }
      current = current.next
    }

    return false
  }

  find(accessID: string) {
    let current = this.head
    while (current) {
      if (current.value.accessId === accessID) {
        return true
      }
      current = current.next
    }

    return false
  }

  removeExistedUser(userId: string) {
    let current = this.head

    while (current) {
      // Check for the list of connected user and remove it if find.
      current.value.connectedUserNames?.forEach((obj: IUsersName) => {
        if (obj.userId !== userId) {
          return obj
        }
      })

      if (current.value.userId === userId) {
        // current?.prev.next = current.next;
        if (current.prev) {
          current.prev.next = current.next
        }
      }

      current = current.next
    }
  }

  addToAdmin(val: IValues): IAddToExistedUser {
    const newUser = this.push(val)
    let current = this.head
    let res: IAddToExistedUser | undefined

    while (current) {
      if (current.value.accessId === val.connectedAccessId) {
        current.value.messages?.push({
          type: 'user_joined', // user_joined
          message: `${newUser?.value.userName} joined to the chat`,
          userName: newUser?.value.userName as string,
          userId: newUser?.value.userId as string,
          timeStamp: new Date(),
        })

        current.value.connectedUserNames?.push({
          name: newUser?.value.userName as string,
          userId: newUser?.value.userId as string,
          connectedAccessId: newUser?.value.connectedAccessId as string,
        })

        res = {
          accessId: newUser?.value.accessId,
          userIds: current.value.connectedUserNames as IUsersName[],
          messages: current.value.messages,
          name: newUser?.value.userName,
          userId: newUser?.value.userId,
          connectedAccessId: newUser?.value.connectedAccessId,
        }
        break
      }

      current = current.next
    }

    return res as IAddToExistedUser
  }
}

export default UserLinkedList
