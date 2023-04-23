export type Msg_Type =
  | 'message'
  | 'started_chat'
  | 'user_joined'
  | 'user_removed'
  | 'unknown'
  | 'typing'
  | 'removed_typing'

export enum Msg_Types {
  msg = 'message',
  join = 'user_joined',
  removed = 'user_removed',
  typing = 'typing',
  rv_typing = 'removed_typing',
  started_chat = 'started_chat',
}

export type IMsg = {
  type: Msg_Type
  chatId: string
  userName: string
  userId: string
  message: string
  timestamp: string
}

class MessageNode {
  public value: IMsg | null
  public next: MessageNode | null

  constructor(obj: IMsg) {
    this.value = obj
    this.next = null
  }
}

export default MessageNode
