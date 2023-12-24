import generateId, { findUserByEmail } from "../../helper";
import Users from "../Models/Users";
import connection from "./data";
import { FAILED_RESPONSE, SUCCESS_RESPONSE_USER_CREATE } from "../../helper/types";
                    

export default class Data {
    constructor () {
        connection.emit("createConnection");
    }

    addUser(username: string, email: string, isRoot = false): Promise<FAILED_RESPONSE | SUCCESS_RESPONSE_USER_CREATE> {
        return new Promise((resolve, reject) => {
            (async function () {
                const searchUser = await findUserByEmail(Users, email);

                // If user existed.
                if (searchUser) {
                    reject({
                        statusCode: 204,
                        message: "User is already exist"
                    });
                } else {
                    const randomId = generateId();
                    randomId.then(async (str: string) => {
                        const newUser = new Users({
                            username: username,
                            email,
                            isRoot,
                            connection_id: str
                        });

                        const saved = await newUser.save();

                        resolve({
                            statusCode: 200,
                            body: {
                                username: saved.username,
                                user_id: saved._id,
                                isRoot: saved.isRoot,
                                connection_id: saved.connection_id,
                                email: saved.email
                            }
                        });
                    });
                }
            })();
        });
    }
}