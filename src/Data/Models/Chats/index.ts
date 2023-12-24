import mongoose from 'mongoose'
import chatSchema from '../../Schemas/Chats'

const Chats = mongoose.model('Chats', chatSchema)
export default Chats;
