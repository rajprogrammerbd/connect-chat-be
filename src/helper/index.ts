import mongoose from "mongoose";
import crypto from "node:crypto";
import { RESOLVE_SOCKET_ID_RESULT } from "./types";

export async function findByEmail<T>(model: mongoose.Model<T>, email: string) {
    return await model.findOne({ email });
}

export async function findBySocketId<T>(model: mongoose.Model<T>, id: string): RESOLVE_SOCKET_ID_RESULT {
    return await model.findOne({ socket_id: id });
}

export async function generateId(length = 10): Promise<string> {
    const result = await crypto.randomBytes(length).toString('hex');

    return result;
}

export async function findByConnectedId<T>(model: mongoose.Model<T>, connectedId: string) {
    return await model.findOne({ connection_id: connectedId });
}