import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Data from "../Data/Events";
import { DISCONNECT, FAILED_RESPONSE, RECONNECT, SEND_MESSAGES, SEND_RESPONSE_CREATED_USER } from "../helper/actions";
import map from "../Data/Maps";
import { SUCCESS_RESPONSE_USER_CREATE } from "../helper/types";

function deletionReconnection(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, data: Data): void {
    const reconnectUser = async function(socketId: string, email: string) {
      try {
        const updated = await data.updateSocketId(socketId, socket.id) as SUCCESS_RESPONSE_USER_CREATE;
        map.add(email, false);
        socket.join(updated.body.connection_id);

        return socket.emit(SEND_RESPONSE_CREATED_USER, updated);
      } catch (er) {
        return socket.emit(FAILED_RESPONSE, { statusCode: 500, message: "Internal Error" });
      }
    }

    const deleteUser = async function() {
      const user = await data.searchUserBySocketId(socket.id);
    
      if (user) {
        map.add(user.email, true);

        setTimeout(async () => {
          try {
            if (map.get(user.email)) {
              if (user.is_root) {
                // delete the whole chat if the user is admin
                const connection_id = user.connection_id;
        
                await data.removeWholeChat(connection_id);
                } else {
                await data.removeNonAdminUser(user.email, user.username, user.connection_id, user.is_root, user.socket_id);
                const chat = await data.get_chat(user.connection_id);
  
                io.to(user.connection_id).emit(SEND_MESSAGES, chat);
                }
            }
          } catch (er) {
            return socket.emit(FAILED_RESPONSE, { statusCode: 500, message: "Internal Error" });
          }
        }, 5000);
      }
    }

    socket.on(DISCONNECT, deleteUser);
    socket.on(RECONNECT, reconnectUser);
}

export default deletionReconnection;
