import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

function socketFailedRespose(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  message: string
) {
  socket.emit('failed_response', {
    connection: false,
    message,
  })
}

export default socketFailedRespose
