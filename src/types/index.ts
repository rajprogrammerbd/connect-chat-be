import { IMsg } from './IMessage'
import IUser from './IUser'

export type IResponseUser = {
  connection: boolean
  message: string
  chatId: string
  connectedUsersList: IUser[]
  messages: IMsg[]
  name: string
  userId: string
}
