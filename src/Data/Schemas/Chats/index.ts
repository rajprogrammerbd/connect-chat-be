import mongoose from 'mongoose'

const { Schema } = mongoose

const chatSchema = new Schema({
  email: {
    messages: [
      {
        userId: String,
        username: String,
        message: String,
        connection_id: String,
        isRoot: Boolean,
      },
    ],
  },
})

export default chatSchema
