import mongoose from 'mongoose'

const { Schema } = mongoose

const chatSchema = new Schema({
  email: {
    messages: [
      {
        userId: {
            type: String,
            required: true,
            min: 2,
            max: 50
        },
        username: {
            type: String,
            required: true,
            min: 2,
            max: 60
        },
        message: {
            type: String,
            required: true,
            min: 1,
            max: 1024
        },
        connection_id: {
            type: String,
            required: true,
            min: 1,
            max: 50
        },
        is_root: {
            type: Boolean,
            required: true
        },
      },
    ],
  },
})

export default chatSchema
