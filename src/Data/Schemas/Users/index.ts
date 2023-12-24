import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 2,
    max: 60
},
  email: {
    type: String,
    required: true,
    min: 2,
    max: 60
  },
  isRoot: {
    type: Boolean,
    required: true
},
  connection_id: {
    type: String,
    required: true,
    min: 1,
    max: 50
  }
})

export default userSchema
