import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CREATE_USER, FAILED_RESPONSE, SEND_MESSAGES, SEND_RESPONSE_CREATED_USER } from "../helper/actions";
import { CREATE_USER_BODY_TYPE } from "../helper/types";
import Data from "../Data/Events";

function creationHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, data: Data): void {
    const createUser = async function(body: CREATE_USER_BODY_TYPE) {
        const { email, is_root, username, connection_id } = body;
        // verifying the body object.
        if (!email) {
          socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "Email is required!" });
          return;
        }
        if (is_root === undefined) {
          socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "is_root is required" });
          return;
        }
        if (!username) {
          socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "username is required" });
          return;
        }
        if (connection_id === undefined) {
          socket.emit(FAILED_RESPONSE, { statusCode: 404, message: "connection_id is required" });
          return;
        }
    
        // add a new user
        try {
          const response = await data.addUser(username, email, is_root, connection_id, socket.id);
  
          if (typeof response.body !== 'string') {
            socket.join(response.body.connection_id);
  
            const chat = await data.get_chat(response.body.connection_id);
            socket.emit(SEND_RESPONSE_CREATED_USER, response);
            io.to(response.body.connection_id).emit(SEND_MESSAGES, chat);
          }
        } catch (er) {
          socket.emit(FAILED_RESPONSE, er);
        }
    }

    socket.on(CREATE_USER, createUser);
}

export default creationHandler;
