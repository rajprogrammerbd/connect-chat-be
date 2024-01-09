import mongoose from "mongoose";

export type RESOLVE_SOCKET_ID_RESULT = Promise<null | FOUND_SUCCESS_BY_USER_BODY>

export type FOUND_SUCCESS_BY_USER_BODY = {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    is_root: boolean;
    connection_id: string;
    socket_id: string;
}

export type SUCCESS_RESPONSE_USER_CREATE = {
    statusCode: number;
    body: FOUND_SUCCESS_BY_USER_BODY
}

export type FAILED_RESPONSE = {
    statusCode: number;
    body: string;
}

export type SAVEDATA_FN_TYPE = {
    object: {
        username: string;
        email: string;
        is_root: boolean;
        socket_id: string;
    },
    connection_id: string | null;
}

export type CREATE_USER_BODY_TYPE = {
    username: string;
    email: string;
    is_root: boolean;
    connection_id: null | string;
}
