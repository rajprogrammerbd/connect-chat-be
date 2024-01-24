import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Data from "../Data/Events";
import { SEND_MESSAGES, UPDATE_GROUP_NAME } from "../helper/actions";
import { UPDATE_GROUP_NAME_REQ_BODY } from "../helper/types";

function updateHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, void>, data: Data): void {
    const updateGroupName = async function(body: UPDATE_GROUP_NAME_REQ_BODY) {
        const { groupName, connection_id, email } = body;

        try {
            await data.updateGroupName(groupName, connection_id, email);
            const chat = await data.get_chat(connection_id);

            io.to(connection_id).emit(SEND_MESSAGES, chat);

        } catch (er) {
            console.error(er);
        }
    }

    socket.on(UPDATE_GROUP_NAME, updateGroupName);
}

export default updateHandler;
