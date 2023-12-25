import colors from "colors";
import { EventEmitter } from "node:events";
import mongoose from "mongoose";
import debug from "debug";

const CONNECTION_STATUS = debug("connection_status");

class Connection extends EventEmitter {}

const connection = new Connection();

// Add listeners to Data Class.
connection.once('createConnection', () => {
    const connection = mongoose.connect(process.env.DATABASE_URL as string);
    connection
        .then(() => CONNECTION_STATUS(colors.bgGreen.italic("Database is connected")))
        .catch(() => CONNECTION_STATUS(colors.bgRed.white("Failed connect to database")))
});

export default connection;
