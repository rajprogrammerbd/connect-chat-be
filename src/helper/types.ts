import { Types } from "mongoose";

export type SUCCESS_RESPONSE_USER_CREATE = {
    statusCode: number;
    body: {
        user_id: Types.ObjectId;
        username: string;
        email: string;
        isRoot: boolean;
        connection_id: string;
    }
}

export type FAILED_RESPONSE = {
    statusCode: number;
    body: string;
}