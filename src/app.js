import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Initializing the app
const app = express();

// Middlewares
// For remote connection and handshake between client and server
// app.use(cors());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// For json inputs
app.use(express.json({
    limit: "16kb"
}));

app.use(express.static("public"));
app.use(cookieParser());
// For url inputs
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())








export { app }