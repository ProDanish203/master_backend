import { app } from "./app.js";
import {config} from "dotenv";
import { connDb } from "./config/db.js";
import path from 'path';
import { fileURLToPath } from 'url';

// .env config
config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log(__dirname)
// config({ path: `${__dirname}/../.env` });



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