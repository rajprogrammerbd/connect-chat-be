import mongoose from "mongoose";
import crypto from "node:crypto";

export async function findUserByEmail<T>(model: mongoose.Model<T>, email: string) {
    return await model.findOne({ email });
}

export default async function generateId(length = 10): Promise<string> {
    const result = await crypto.randomBytes(length).toString('hex');

    return result;
}