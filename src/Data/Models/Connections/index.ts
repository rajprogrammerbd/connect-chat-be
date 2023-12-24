import mongoose from "mongoose";
import connectionSchema from "../../Schemas/Connections";

const Connections = mongoose.model('Connections', connectionSchema);
export default Connections;
