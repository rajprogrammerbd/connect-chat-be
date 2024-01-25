import { uniqueNamesGenerator, adjectives, colors } from "unique-names-generator";
import { FAILED_RESPONSE, FOUND_SUCCESS_BY_USER_BODY, RESOLVE_SOCKET_ID_RESULT, RESPONSE_CHAT_BODY, SAVEDATA_FN_TYPE, SUCCESS_RESPONSE_USER_CREATE, TYPE_CHAT_MODEL } from "../../helper/types";
import { findByConnectedId, findByEmail, findBySocketId, findChatsByConnectionId, generateId, removeUserByEmail } from "../../helper";
import Users from "../Models/Users";
import Chats from "../Models/Chats";
import connection from "./data";

export default class Data {
    constructor () {
        connection.emit("createConnection");
    }

    async searchUserBySocketId(id: string): Promise<RESOLVE_SOCKET_ID_RESULT | null> {
        try {
            const user = await findBySocketId(Users, id);

            return Promise.resolve(user);
        } catch (er) {
            return Promise.reject({ status: 500, message: 'Failed to search a user' });
        }
    }

    protected async removeAllUsersByConnectionId(connection_id: string) {
        try {
            const counted = await Users.deleteMany({ connection_id });

            if (counted.deletedCount > 0) {
                return Promise.resolve();
            }
        } catch (er) {
            return Promise.reject(er);
        }
    }

    protected async removeAllChats(connection_id: string) {
        try {
            const counted = await Chats.deleteMany({ connection_id });

            if (counted.deletedCount > 0) {
                return Promise.resolve();
            }
        } catch (er) {
            return Promise.reject(er);
        }
    }

    async removeWholeChat(connection_id: string) {
        try {
            const promise1 = this.removeAllUsersByConnectionId(connection_id);
            const promise2 = this.removeAllChats(connection_id);
    
            await Promise.all([promise1, promise2]);
    
            return Promise.resolve();
        } catch (er) {
            return Promise.reject(er);
        }
    }

    protected async saveData(obj: SAVEDATA_FN_TYPE): Promise<FOUND_SUCCESS_BY_USER_BODY> {
        const { object, connection_id, socket_id } = obj;

        const randomId = await generateId();
        const { email, is_root, username } = object;

        const newUser = new Users({
            username: username,
            email,
            socket_id,
            is_root,
            connection_id: connection_id ? connection_id : randomId
        });

        const saved = await newUser.save();

        return Promise.resolve(saved);

    }

    addChats(username: string, connection_id: string, is_root: boolean, socket_id: string): Promise<TYPE_CHAT_MODEL> {
        const groupName = uniqueNamesGenerator({ dictionaries: [adjectives, colors] });

        const newChat = new Chats({
            connection_id,
            messages: [
                {
                    username,
                    message: `${username} has started the chat`,
                    connection_id,
                    is_root,
                    socket_id,
                    notification: true
                }
            ],
            group_name: groupName
        });

        const chats = newChat.save();

        return Promise.resolve(chats);
    }

    protected async findChatsAndUpdate(connection_id: string, username: string, is_root: boolean, group_name: string) {
        const chat = await findChatsByConnectionId(Chats, connection_id,);

        if (!chat) {
            return Promise.reject({ statusCode: 500, message: 'Internal Error' });
        }

        chat.group_name = group_name;
        chat.messages.push({
            username,
            connection_id,
            is_root,
            message: `${username} joined the chat`,
            notification: true
        });

        const docs = await Chats.findOneAndUpdate({ connection_id }, { messages: chat.messages }, {
            new: true
        });

        return Promise.resolve(docs);
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
                    const searchChat = await findByConnectedId(Chats, connection_id);

                    if (searchConnectedId && searchChat) {
                        // save a existing user.
                        const data = await this.saveData({ object: { username, email, is_root }, connection_id, socket_id });
                        await this.findChatsAndUpdate(data.connection_id, data.username, data.is_root, searchChat.group_name);
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

            const data = await this.saveData({ object: { username, email, is_root }, connection_id: null, socket_id });
            await this.addChats(data.username, data.connection_id, data.is_root, data.socket_id);

            return Promise.resolve({
                statusCode: 200,
                body: data
            });
        } catch (er) {
            return Promise.reject(er);
        }
    }

    async addText(connection_id: string, is_root: boolean, username: string, message: string, socket_id: string): Promise<void> {
        try {
            const value = await Chats.findOne({ connection_id });
            value?.messages.push({
                connection_id,
                is_root,
                username,
                message,
                socket_id,
                notification: false
            });
    
            await value?.save();

            return Promise.resolve();
        } catch (er) {
            return Promise.reject(er);
        }
    }

    async removeNonAdminUser(email: string, username: string, connection_id: string, is_root: boolean, socket_id: string): Promise<void> {
        try {
            const res = await removeUserByEmail(Users, email);

            if (res.deletedCount) {
                const message = `${username} is left the chat`;
                await this.addText(connection_id, is_root, username, message, socket_id);
                return Promise.resolve();
            }
        } catch (er) {
            return Promise.reject(er);
        }
    }

    async get_chat(connection_id: string): Promise<RESPONSE_CHAT_BODY | FAILED_RESPONSE> {
        try {
            const chats = await Chats.findOne({ connection_id });
            
            if (!chats) {
                return Promise.reject({ statusCode: 404, message: "User not found!" });
            }

            return Promise.resolve(chats);
        } catch (er) {
            return Promise.reject({ statusCode: 500, message: "Internal Error" });
        }
    }

    async updateSocketId(oldSocketId: string, newSocketId: string): Promise<SUCCESS_RESPONSE_USER_CREATE | FAILED_RESPONSE> {
        try {
            const filter = {
                socket_id: oldSocketId
            };
            const update = {
                socket_id: newSocketId
            };
            
            const response = await Users.findOneAndUpdate(filter, update, { new: true });

            if (response) {
                return Promise.resolve({ statusCode: 200, body: response });
            }

            return Promise.reject({ statusCode: 404, message: "User not found" });
        } catch (er) {
            return Promise.reject({ statusCode: 500, message: "Internal Error" })
        }
    }

    async updateGroupName(group_name: string, connection_id: string, email: string): Promise<void> {
        try {
            const user = await this.findUser(email);

            const chat = await Chats.findOne({ connection_id });
            chat?.messages.push({
                username: user?.username,
                connection_id: user?.connection_id,
                is_root: user?.is_root,
                message: `${user?.username} changed the group name`,
                notification: true
            });

            chat!.group_name = group_name;

            await chat?.save();

            return Promise.resolve();
        } catch (er) {
            return Promise.reject();
        }
    }

    async findUser(email: string) {
        return await Users.findOne({ email });
    }
}
