import mongoose from "mongoose";
import userSchema from "../../Schemas/Users";

const Users = mongoose.model('Users', userSchema);

export default Users;
