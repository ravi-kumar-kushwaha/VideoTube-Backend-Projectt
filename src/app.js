import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();
// middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"120mb"}));
app.use(express.urlencoded({extended:true,limit:"120mb"}));
app.use(express.static("public"));
app.use(cookieParser());
//import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/userRoutes.js";
//healthcheck routes
app.use("/api/v1/healthcheck",healthcheckRouter);
//user routes
app.use("/api/v1/users",userRouter);
//error middleware
app.use(errorHandler);
export {app};