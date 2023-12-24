import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    email: String,
    isRoot: Boolean,
    connection_id: String,
});

export default userSchema;