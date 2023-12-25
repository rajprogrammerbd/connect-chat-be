import { findByConnectedId, findByEmail, generateId } from "../../helper";
import Users from "../Models/Users";
import connection from "./data";
import { FAILED_RESPONSE, SAVEDATA_FN_TYPE, SAVEDATA_FN_TYPE_CB, SUCCESS_RESPONSE_USER_CREATE } from "../../helper/types";                    

export default class Data {
    constructor () {
        connection.emit("createConnection");
    }

    protected saveData(obj: SAVEDATA_FN_TYPE) {
        const { object, cb, connection_id } = obj;

        const randomId = generateId();
        const { email, socket_id, is_root, username } = object;

        randomId.then(async (str: string) => {
            const newUser = new Users({
                username: username,
                email,
                is_root,
                socket_id,
                connection_id: connection_id ? connection_id : str
            });

            const saved = await newUser.save();

            cb({ socket_id: saved.socket_id, connection_id: saved.connection_id, email: saved.email, is_root: saved.is_root, statusCode: 200, username: saved.username, user_id: saved._id })
        });
    }



    addUser(username: string, email: string, is_root = false, connection_id: string | null, socket_id: string): Promise<FAILED_RESPONSE | SUCCESS_RESPONSE_USER_CREATE> {
        return new Promise((resolve, reject) => {
            (async function (thisValue) {
                const searchUser = await findByEmail(Users, email);

                // If user existed.
                if (searchUser) {
                    reject({
                        statusCode: 204,
                        message: "User is already exist"
                    });
                } else {
                    if (!is_root) {
                        if (typeof connection_id === 'string') {
                            const searchConnectedId = await findByConnectedId(Users, connection_id);

                            if (searchConnectedId) {
                                thisValue.saveData({ object: { username, email, is_root, socket_id }, connection_id, cb: async (res: SAVEDATA_FN_TYPE_CB) => {
                                    resolve({
                                        statusCode: res.statusCode,
                                        body: {
                                            username: res.username,
                                            user_id: res.user_id,
                                            isRoot: res.is_root,
                                            connection_id: res.connection_id,
                                            email: res.email,
                                            socket_id: res.socket_id
                                        }
                                    });
                                }});
                            } else {
                                reject({
                                    statusCode: 404,
                                    message: "Not found a connection, please try again"
                                })
                            }
                        } else {
                            reject({ statusCode: 500, message: "Internal error" });
                        }
                    } else {
                        thisValue.saveData({ object: { socket_id, username, email, is_root }, connection_id: null, cb: (res: SAVEDATA_FN_TYPE_CB) => {
                            resolve({
                                statusCode: res.statusCode,
                                body: {
                                    username: res.username,
                                    user_id: res.user_id,
                                    isRoot: res.is_root,
                                    connection_id: res.connection_id,
                                    email: res.email,
                                    socket_id: res.socket_id
                                }
                            });
                        }});
                    }
                }
            })(this);
        });
    }
}