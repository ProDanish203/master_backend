import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connDb = async () => {
    try{
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Database Connected Successfully: ${conn.connection.host}`)
        // console.log(`Database Connected Successfully: ${mongoose.connection.host}`)
    }
    catch(e){
        console.log("Database Connection Error: \n", e)
    }
}