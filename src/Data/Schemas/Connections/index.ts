import mongoose from 'mongoose'

const { Schema } = mongoose

const connectionSchema = new Schema({
  connection_id: {
    connections: [String],
  },
})

export default connectionSchema
