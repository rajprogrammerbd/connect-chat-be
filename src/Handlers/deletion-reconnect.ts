import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Data from "../Data/Events";
import { DISCONNECT, RECONNECT, SEND_MESSAGES } from "../helper/actions";

function deletionReconnection(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, data: Data): void {
    const reconnectUser = async function(socketId: string) {
      // email check here.
      console.log('email got ', socketId, socket.id);
    }

    const deleteUser = async function() {
        setTimeout(async () => {
            const user = await data.searchUserBySocketId(socket.id);
      
            if (user) {
              if (user.is_root) {
                // delete the whole chat if the user is admin
                const connection_id = user.connection_id;
        
                data.removeWholeChat(connection_id);
              } else {
                await data.removeNonAdminUser(user.email, user.username, user.connection_id, user.is_root, user.socket_id);
                const chat = await data.get_chat(user.connection_id);
      
                io.to(user.connection_id).emit(SEND_MESSAGES, chat);
              }
            }
          }, 10000);
    }

    socket.on(DISCONNECT, deleteUser);
    socket.on(RECONNECT, reconnectUser);
}

export default deletionReconnection;
