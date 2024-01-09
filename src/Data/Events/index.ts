import { findByConnectedId, findByEmail, findBySocketId, generateId } from "../../helper";
import Users from "../Models/Users";
import connection from "./data";
import { FAILED_RESPONSE, FOUND_SUCCESS_BY_USER_BODY, RESOLVE_SOCKET_ID_RESULT, SAVEDATA_FN_TYPE, SUCCESS_RESPONSE_USER_CREATE } from "../../helper/types";                    

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

    addChats() {
        // need to code here.
    }

    async addUser(username: string, email: string, is_root = false, connection_id: string | null, socket_id: string): Promise<FAILED_RESPONSE | SUCCESS_RESPONSE_USER_CREATE> {
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

        return Promise.resolve({
            statusCode: 200,
            body: data
        });
    }
}