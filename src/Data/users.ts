import { IUsersName } from '../types';
import MessageLinkedList from './messages';

export type IValues = {
  userName: string;
  userId: string;
  accessId: string;
  connectedUserNames?: IUsersName[];
  messages?: MessageLinkedList;
}

type IAddToExistedUser = {
  accessId: string | undefined;
  userIds: IUsersName[] ;
  messages: MessageLinkedList | undefined;
  name: string | undefined;
  userId: string | undefined;
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

  push(val: IValues) {
    const newNode = new UserNode(val);

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

  find(accessID: string) {

    let current = this.head;
    while (current) {
        if (current.value.accessId === accessID) {
            return true;
        }
        current = current.next;
    }

    return false;
  }

  removeExistedUser(userId: string) {
    let current = this.head;

    while (current) {
      // Check for the list of connected user and remove it if find.
      current.value.connectedUserNames?.forEach((obj: IUsersName) => {
        if (obj.userId !== userId) {
          return obj;
        }
      });

      if (current.value.userId === userId) {
        // current?.prev.next = current.next;
        if (current.prev) {
          current.prev.next = current.next;
        }
      }

      current = current.next;
    }
  }
  
  addToAdmin(val: IValues): IAddToExistedUser {
        const newUser = this.push(val);
        let current = this.head;
        let res: IAddToExistedUser | undefined;

        while (current) {
            if (current.value.accessId === val.accessId) {
                current.value.connectedUserNames?.push({ name: newUser?.value.userName as string, userId: newUser?.value.userId as string });
                
                res = {
                  accessId: newUser?.value.accessId,
                  userIds: current.value.connectedUserNames as IUsersName[],
                  messages: current.value.messages,
                  name: newUser?.value.userName,
                  userId: newUser?.value.userId
                };
                break;
            }

            current = current.next;
        }

        return res as IAddToExistedUser;
  }
}

export default UserLinkedList
