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

export type TYPE_MESSAGE_SYNTAX = {
    username: string;
    message: string;
    connection_id: string;
    is_root: boolean;
    notification: boolean;
}

export type TYPE_CHAT_MODEL = {
    connection_id: string;
    group_name: string;
    messages: TYPE_MESSAGE_SYNTAX[];
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
    };
    socket_id: string;
    connection_id: string | null;
}

export type CREATE_USER_BODY_TYPE = {
    username: string;
    email: string;
    is_root: boolean;
    connection_id: null | string;
}

export type RESPONSE_CHAT_MESSAGE = {
    username: string;
    message: string;
    connection_id: string;
    is_root: boolean;
}

export type RESPONSE_CHAT_BODY = {
    _id: mongoose.Types.ObjectId;
    connection_id: string;
    group_name: string;
    messages: RESPONSE_CHAT_MESSAGE[];
}

export type UPDATE_GROUP_NAME_REQ_BODY = {
    groupName: string;
    connection_id: string;
    email: string;
}

export type USER_SEND_MESSAGE = {
    message: string;
    connection_id: string;
    email: string;
    group_name: string;
    is_root: boolean;
    username: string;
    socket_id: string;
}
