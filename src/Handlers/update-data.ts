import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SEND_MESSAGES, SEND_UPDATE_GROUP_NAME, SEND_USER_MESSAGE, UPDATE_GROUP_NAME } from "../helper/actions";
import { UPDATE_GROUP_NAME_REQ_BODY, USER_SEND_MESSAGE } from "../helper/types";
import Data from "../Data/Events";

function updateHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, data: Data): void {
    const updateGroupName = async function(body: UPDATE_GROUP_NAME_REQ_BODY) {
        const { groupName, connection_id, email } = body;

        try {
            await data.updateGroupName(groupName, connection_id, email);
            const chat = await data.get_chat(connection_id);

            io.to(connection_id).emit(SEND_UPDATE_GROUP_NAME, { data: chat, connection_id });

        } catch (er) {
            console.error(er);
        }
    }

    const updateMessage = async function (body: USER_SEND_MESSAGE) {
        const { connection_id, is_root, username, message, socket_id } = body;

        await data.addText(connection_id, is_root, username, message, socket_id);

        const chat = await data.get_chat(connection_id);
  
        io.to(connection_id).emit(SEND_MESSAGES, chat);
    }

    socket.on(UPDATE_GROUP_NAME, updateGroupName);
    socket.on(SEND_USER_MESSAGE, updateMessage);
}

export default updateHandler;
