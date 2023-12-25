import { Types } from "mongoose";

export type SUCCESS_RESPONSE_USER_CREATE = {
    statusCode: number;
    body: {
        user_id: Types.ObjectId;
        username: string;
        email: string;
        isRoot: boolean;
        connection_id: string;
        socket_id: string;
    }
}

export type FAILED_RESPONSE = {
    statusCode: number;
    body: string;
}

export type SAVEDATA_FN_TYPE_CB = {
    statusCode: number;
    username: string;
    user_id: Types.ObjectId;
    is_root: boolean;
    connection_id: string;
    email: string;
    socket_id: string;
}

export type SAVEDATA_FN_TYPE = {
    object: {
        username: string;
        email: string;
        is_root: boolean;
        socket_id: string;
    },
    cb: (o: SAVEDATA_FN_TYPE_CB) => void,
    connection_id: string | null;
}

export type CREATE_USER_BODY_TYPE = {
    username: string;
    email: string;
    is_root: boolean;
    connection_id: null | string;
}