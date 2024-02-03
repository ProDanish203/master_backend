import { app } from "./app.js";
import {config} from "dotenv";
import { connDb } from "./config/db.js";

// .env config
config();



// Routes


// Validation middleware


// Database connection And Listening on port
const port = process.env.PORT || 4000

connDb()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is listening live on port:${port}`)
    })
})
.catch((error) => {
    console.log(`Database Connection Error: ${error}`)
})