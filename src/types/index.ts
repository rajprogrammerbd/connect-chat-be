import MessageLinkedList from '../Data/messages'

export type IUsersName = {
  name: string
  userId: string
  connectedAccessId: string
}

export type IPreparedDataType = {
  connection: boolean
  message: string
  userId?: string
  connectedAccessId?: string
  accessId?: string
  name?: string
  userIds?: IUsersName[]
  messages?: MessageLinkedList
}

export type IUserTyping = {
  status: boolean;
  id: string;
}