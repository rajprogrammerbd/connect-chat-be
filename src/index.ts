import mongoose from "mongoose";
import Users from "./Data/Models/Users";

const URL = "mongodb://localhost:27017";
const connection = mongoose.connect(URL);

connection
  .then(() => {
    const newUser = new Users({
      connection_id: '',
      email: '',
      username: '',
      isRoot: true,
    });

    newUser.save()
      .then(() => console.log('data is saved'))
      .catch(er => console.log(`Failed to save `, er))
  })
  .catch(er => console.error(er))
