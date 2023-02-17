import MessageLinkedList from '../Data/messages'

type IFind = {
  typingId: string
}

export function findTypingIdAvailable(
  obj: IFind,
  list: MessageLinkedList
): boolean {
  let currentNode = list.head

  while (currentNode) {
    if (currentNode.value.typingId === obj.typingId) {
      return true
    }

    currentNode = currentNode.next
  }

  return false
}
