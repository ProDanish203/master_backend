import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// Middleware
import { errorMiddleware } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import xss from "xss-clean";
import expMongoSanitize from "express-mongo-sanitize";
// Routes
import userRoute from "./routes/user.routes.js";


// Initializing the app
const app = express();

// Middlewares
// For remote connection and handshake between client and server
const corsOptions = {
    credentials: true,
    origin: 
    process.env.NODE_ENV === "production"
    ? "http://localhost:3000"
    : "http://localhost:3000"
}
app.use(cors(corsOptions));

// For json inputs
app.use(express.json({
    limit: "16kb"
}));


app.use(express.static("public"));
// For url inputs
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())

app.use(morgan('dev'));
app.use(xss());
app.disable('x-powered-by')
app.use(expMongoSanitize());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));



// Routes
app.use("/api/v1/user", userRoute);


// Custom middleware
app.use(errorMiddleware)



export { app }