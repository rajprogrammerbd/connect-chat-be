import MessageLinkedList from '../Data/messages'

export type IUsersName = {
  name: string
  userId: string
}

export type IPreparedDataType = {
  connection: boolean
  message: string
  userId?: string
  accessId?: string
  name?: string
  userIds?: IUsersName[]
  messages?: MessageLinkedList
}
