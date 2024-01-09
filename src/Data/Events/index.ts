import { FAILED_RESPONSE, FOUND_SUCCESS_BY_USER_BODY, RESOLVE_SOCKET_ID_RESULT, SAVEDATA_FN_TYPE, SUCCESS_RESPONSE_USER_CREATE, TYPE_CHAT_MODEL } from "../../helper/types";
import { findByConnectedId, findByEmail, findBySocketId, findChatsByConnectionId, generateId } from "../../helper";
import Users from "../Models/Users";
import Chats from "../Models/Chats";
import connection from "./data";

export default class Data {
    constructor () {
        connection.emit("createConnection");
    }

    async searchUserBySocketId(id: string): RESOLVE_SOCKET_ID_RESULT {
        const user = await findBySocketId(Users, id);

        return user;
    }

    protected async saveData(obj: SAVEDATA_FN_TYPE): Promise<FOUND_SUCCESS_BY_USER_BODY> {
        const { object, connection_id } = obj;

        const randomId = await generateId();
        const { email, socket_id, is_root, username } = object;

        const newUser = new Users({
            username: username,
            email,
            is_root,
            socket_id,
            connection_id: connection_id ? connection_id : randomId
        });

        const saved = await newUser.save();

        return Promise.resolve(saved);

    }

    addChats(username: string, connection_id: string, is_root: boolean, socket_id: string): Promise<TYPE_CHAT_MODEL> {
        const newChat = new Chats({
            connection_id,
            messages: [
                {
                    username,
                    message: `${username} has started the chat`,
                    connection_id,
                    is_root,
                    socket_id
                }
            ]
        });

        const chats = newChat.save();

        return Promise.resolve(chats);
    }

    protected async findChatsAndUpdate(connection_id: string, username: string, is_root: boolean, socket_id: string) {
        const chat = await findChatsByConnectionId(Chats, connection_id,);
        console.log(chat);

        if (!chat) {
            return Promise.reject({ statusCode: 500, message: 'Internal Error' });
        }

        chat.messages.push({
            username,
            connection_id,
            is_root,
            message: `${username} joined the chat`,
            socket_id
        });

        const doc = await Chats.findOneAndUpdate({ connection_id }, { messages: chat.messages }, {
            new: true
        });

        return Promise.resolve(doc);
    }

    async addUser(username: string, email: string, is_root = false, connection_id: string | null, socket_id: string): Promise<FAILED_RESPONSE | SUCCESS_RESPONSE_USER_CREATE> {
        try {
            const searchUser = await findByEmail(Users, email);
            
            // If user existed.
            if (searchUser) {
                return Promise.reject({
                    statusCode: 204,
                    message: "User is already exist"
                });
            }

            if (!is_root) {
                if (typeof connection_id === 'string') {
                    const searchConnectedId = await findByConnectedId(Users, connection_id);

                    if (searchConnectedId) {
                        // save a existing user.
                        const data = await this.saveData({ object: { username, email, is_root, socket_id }, connection_id });
                        await this.findChatsAndUpdate(data.connection_id, data.username, data.is_root, socket_id);
                        return Promise.resolve({
                            statusCode: 200,
                            body: data
                        });
                    } else {
                        return Promise.reject({
                            statusCode: 404,
                            message: "Not found a connection, please try again"
                        })
                    }
                }
                
                return Promise.reject({ statusCode: 500, message: "Internal error" });
            }

            const data = await this.saveData({ object: { socket_id, username, email, is_root }, connection_id: null });
            await this.addChats(data.username, data.connection_id, data.is_root, data.socket_id);

            return Promise.resolve({
                statusCode: 200,
                body: data
            });
        } catch (er) {
            return Promise.reject(er);
        }
    }
}